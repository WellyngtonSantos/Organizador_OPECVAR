import prisma from '../config/database';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';
import { historyService } from './history.service';

interface TaskFilters {
  status?: string;
  priority?: string;
  bucketId?: string;
  analystId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export class TaskService {
  async findAll(filters: TaskFilters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.bucketId) {
      where.bucketId = filters.bucketId;
    }
    if (filters.analystId) {
      where.analystId = filters.analystId;
    }
    if (filters.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    // Build orderBy from sortBy/sortOrder params
    const allowedSortFields = [
      'name', 'status', 'priority', 'receivedDate', 'startDate',
      'estimatedCompletionDate', 'actualCompletionDate', 'estimatedHours',
      'actualHours', 'queueOrder', 'createdAt', 'updatedAt',
    ];
    let orderBy: any;
    if (filters.sortBy && allowedSortFields.includes(filters.sortBy)) {
      const direction = filters.sortOrder === 'asc' ? 'asc' : 'desc';
      orderBy = [{ [filters.sortBy]: direction }];
    } else {
      orderBy = [{ receivedDate: 'desc' as const }, { createdAt: 'desc' as const }];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          bucket: true,
          analyst: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        bucket: true,
        analyst: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
        notes: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        history: {
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
        },
      },
    });

    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }

    return task;
  }

  async create(data: CreateTaskInput, userId?: string) {
    const { labelIds, ...taskData } = data;

    const task = await prisma.task.create({
      data: {
        ...taskData,
        receivedDate: taskData.receivedDate ? new Date(taskData.receivedDate) : new Date(),
        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
        estimatedCompletionDate: taskData.estimatedCompletionDate ? new Date(taskData.estimatedCompletionDate) : null,
        createdById: userId ?? null,
        analystId: taskData.analystId ?? null,
        labels: labelIds && labelIds.length > 0
          ? {
              create: labelIds.map((labelId) => ({ labelId })),
            }
          : undefined,
      },
      include: {
        bucket: true,
        analyst: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
      },
    });

    if (userId) {
      await historyService.logCreation(task.id, userId);
    }

    return task;
  }

  async update(id: string, data: UpdateTaskInput, userId: string) {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('TASK_NOT_FOUND');
    }

    const { labelIds, ...updateFields } = data;

    // Track changes for history
    const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];

    const dateFields = ['receivedDate', 'startDate', 'estimatedCompletionDate', 'actualCompletionDate'];
    const processedData: any = { ...updateFields };

    for (const [key, value] of Object.entries(updateFields)) {
      if (value === undefined) continue;

      if (dateFields.includes(key)) {
        processedData[key] = value ? new Date(value as string) : null;
      }

      const oldVal = (existing as any)[key];
      const oldStr = oldVal !== null && oldVal !== undefined ? String(oldVal) : null;
      const newStr = value !== null && value !== undefined ? String(value) : null;

      if (oldStr !== newStr) {
        changes.push({ field: key, oldValue: oldStr, newValue: newStr });
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...processedData,
        labels: labelIds !== undefined
          ? {
              deleteMany: {},
              create: labelIds.map((labelId) => ({ labelId })),
            }
          : undefined,
      },
      include: {
        bucket: true,
        analyst: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
      },
    });

    // Log label changes if applicable
    if (labelIds !== undefined) {
      const oldLabelIds = await prisma.taskLabel.findMany({
        where: { taskId: id },
        select: { labelId: true },
      });
      // Labels were already replaced above, so we log the change
      changes.push({
        field: 'labels',
        oldValue: oldLabelIds.map((l) => l.labelId).join(',') || null,
        newValue: labelIds.join(',') || null,
      });
    }

    // Log all changes to history
    for (const change of changes) {
      await historyService.logChange(id, userId, change.field, change.oldValue, change.newValue);
    }

    return task;
  }

  async bulkUpdateStatus(taskIds: string[], status: string, userId: string) {
    // Get current status for each task to log history
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
      select: { id: true, status: true },
    });

    if (tasks.length === 0) {
      throw new Error('NO_TASKS_FOUND');
    }

    // Update all tasks
    await prisma.task.updateMany({
      where: { id: { in: taskIds } },
      data: { status: status as any },
    });

    // Log history for each changed task
    for (const task of tasks) {
      if (task.status !== status) {
        await historyService.logChange(task.id, userId, 'status', task.status, status);
      }
    }

    return { updatedCount: tasks.length };
  }

  async delete(id: string) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }

    return prisma.task.delete({ where: { id } });
  }
}

export const taskService = new TaskService();
