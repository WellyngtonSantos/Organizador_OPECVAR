import prisma from '../config/database';

export class QueueService {
  // Get tasks for a specific analyst ordered by queueOrder
  async getByAnalyst(analystId: string) {
    return prisma.task.findMany({
      where: {
        analystId,
        status: { notIn: ['COMPLETED', 'CANCELED'] },
      },
      include: {
        bucket: true,
        labels: { include: { label: true } },
      },
      orderBy: { queueOrder: 'asc' },
    });
  }

  // Reorder: receives an array of taskIds in the new order, updates queueOrder for each
  async reorder(analystId: string, taskIds: string[]) {
    // Verify all tasks belong to this analyst
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds }, analystId },
      select: { id: true },
    });

    if (tasks.length !== taskIds.length) {
      throw new Error('INVALID_TASK_IDS');
    }

    // Update queueOrder for each task in a transaction
    await prisma.$transaction(
      taskIds.map((id, index) =>
        prisma.task.update({
          where: { id },
          data: { queueOrder: index },
        })
      )
    );

    return this.getByAnalyst(analystId);
  }
}

export const queueService = new QueueService();
