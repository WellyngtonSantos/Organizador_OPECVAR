import prisma from '../config/database';

export class HistoryService {
  async logChange(taskId: string, userId: string, field: string, oldValue: string | null, newValue: string | null) {
    return prisma.taskHistory.create({
      data: {
        taskId,
        userId,
        field,
        oldValue,
        newValue,
      },
    });
  }

  async logCreation(taskId: string, userId: string) {
    return prisma.taskHistory.create({
      data: {
        taskId,
        userId,
        field: 'task',
        oldValue: null,
        newValue: 'created',
      },
    });
  }

  async getByTaskId(taskId: string) {
    return prisma.taskHistory.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { changedAt: 'desc' },
    });
  }
}

export const historyService = new HistoryService();
