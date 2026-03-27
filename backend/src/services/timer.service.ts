import prisma from '../config/database';

export class TimerService {
  // Get active timer for user (only 1 allowed at a time)
  async getActiveTimer(userId: string) {
    return prisma.timerSession.findFirst({
      where: { userId, stoppedAt: null },
      include: { task: { select: { id: true, name: true } } },
    });
  }

  // Start timer - fails if user already has active timer
  async start(taskId: string, userId: string) {
    const active = await this.getActiveTimer(userId);
    if (active) {
      throw new Error('TIMER_ALREADY_ACTIVE');
    }
    // Verify task exists
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }
    return prisma.timerSession.create({
      data: { taskId, userId },
      include: { task: { select: { id: true, name: true } } },
    });
  }

  // Stop timer - calculates hours and updates task.actualHours
  async stop(sessionId: string, userId: string) {
    const session = await prisma.timerSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new Error('SESSION_NOT_FOUND');
    if (session.userId !== userId) throw new Error('SESSION_NOT_OWNED');
    if (session.stoppedAt) throw new Error('SESSION_ALREADY_STOPPED');

    const stoppedAt = new Date();
    const hours = (stoppedAt.getTime() - session.startedAt.getTime()) / 3600000;
    const roundedHours = Math.round(hours * 100) / 100;

    const [updated] = await prisma.$transaction([
      prisma.timerSession.update({
        where: { id: sessionId },
        data: { stoppedAt, hours: roundedHours },
        include: { task: { select: { id: true, name: true } } },
      }),
      prisma.task.update({
        where: { id: session.taskId },
        data: { actualHours: { increment: roundedHours } },
      }),
    ]);

    return updated;
  }

  // Get all sessions for a task
  async getByTaskId(taskId: string) {
    return prisma.timerSession.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { startedAt: 'desc' },
    });
  }

  // Delete a session (adjust actualHours if it had hours)
  async delete(sessionId: string, userId: string) {
    const session = await prisma.timerSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new Error('SESSION_NOT_FOUND');
    if (session.userId !== userId) throw new Error('SESSION_NOT_OWNED');

    if (session.hours && session.hours > 0) {
      await prisma.$transaction([
        prisma.timerSession.delete({ where: { id: sessionId } }),
        prisma.task.update({
          where: { id: session.taskId },
          data: { actualHours: { decrement: session.hours } },
        }),
      ]);
    } else {
      await prisma.timerSession.delete({ where: { id: sessionId } });
    }
  }
}

export const timerService = new TimerService();
