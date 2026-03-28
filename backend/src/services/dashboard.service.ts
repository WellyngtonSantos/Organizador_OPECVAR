import prisma from '../config/database';
import { getWeekRange } from '../utils/dateHelpers';

interface WeeklyDashboardResult {
  summary: {
    open: number;
    completed: number;
    standBy: number;
    overdue: number;
  };
  hoursPerDay: {
    day: string;
    hours: number;
    analyst?: string;
  }[];
  hoursPerAnalyst: {
    analyst: string;
    estimatedHours: number;
    actualHours: number;
  }[];
  bucketDistribution: {
    bucket: string;
    count: number;
    color: string;
  }[];
  weeklyTasks: {
    day: string;
    received: number;
    completed: number;
  }[];
  efficiency: {
    estimated: number;
    actual: number;
    ratio: number;
  };
  overdueAlerts: {
    taskId: string;
    taskName: string;
    analyst: string;
    daysOverdue: number;
  }[];
}

export class DashboardService {
  async getWeeklyDashboard(weekStart: string, analystId?: string): Promise<WeeklyDashboardResult> {
    const baseDate = new Date(weekStart);
    const { start, end } = getWeekRange(baseDate);

    const [summary, hoursPerDay, hoursPerAnalyst, bucketDistribution, weeklyTasks, efficiency, overdueAlerts] =
      await Promise.all([
        this.getSummary(start, end, analystId),
        this.getHoursPerDay(start, end, analystId),
        this.getHoursPerAnalyst(start, end, analystId),
        this.getBucketDistribution(start, end, analystId),
        this.getWeeklyTasks(start, end, analystId),
        this.getEfficiency(start, end, analystId),
        this.getOverdueAlerts(analystId),
      ]);

    return {
      summary,
      hoursPerDay,
      hoursPerAnalyst,
      bucketDistribution,
      weeklyTasks,
      efficiency,
      overdueAlerts,
    };
  }

  private async getSummary(start: Date, end: Date, analystId?: string) {
    const analystFilter = analystId ? { analystId } : {};
    const tasks = await prisma.task.findMany({
      where: {
        ...analystFilter,
        OR: [
          { receivedDate: { gte: start, lte: end } },
          {
            status: { in: ['NOT_STARTED', 'IN_PROGRESS', 'STAND_BY'] },
            receivedDate: { lte: end },
          },
        ],
      },
      select: {
        status: true,
        estimatedCompletionDate: true,
      },
    });

    const now = new Date();
    let open = 0;
    let completed = 0;
    let standBy = 0;
    let overdue = 0;

    for (const task of tasks) {
      if (task.status === 'COMPLETED') {
        completed++;
      } else if (task.status === 'STAND_BY') {
        standBy++;
      } else if (task.status !== 'CANCELED') {
        open++;
      }

      if (
        task.estimatedCompletionDate &&
        now > task.estimatedCompletionDate &&
        task.status !== 'COMPLETED' &&
        task.status !== 'CANCELED'
      ) {
        overdue++;
      }
    }

    return { open, completed, standBy, overdue };
  }

  private async getHoursPerDay(start: Date, end: Date, analystId?: string) {
    const userFilter = analystId ? { userId: analystId } : {};
    const sessions = await prisma.timerSession.findMany({
      where: {
        ...userFilter,
        startedAt: { gte: start, lte: end },
        stoppedAt: { not: null },
      },
      include: {
        user: { select: { name: true } },
      },
    });

    const dayMap = new Map<string, number>();
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayLabel = dayNames[d.getDay()];
      if (!dayMap.has(dayLabel)) {
        dayMap.set(dayLabel, 0);
      }
    }

    for (const session of sessions) {
      if (session.hours) {
        const dayLabel = dayNames[session.startedAt.getDay()];
        dayMap.set(dayLabel, (dayMap.get(dayLabel) || 0) + session.hours);
      }
    }

    return Array.from(dayMap.entries()).map(([day, hours]) => ({
      day,
      hours: Math.round(hours * 100) / 100,
    }));
  }

  private async getHoursPerAnalyst(start: Date, end: Date, analystId?: string) {
    const userFilter = analystId ? { id: analystId } : {};
    const analysts = await prisma.user.findMany({
      where: { role: 'ANALYST', active: true, ...userFilter },
      select: {
        name: true,
        assignedTasks: {
          where: {
            OR: [
              { receivedDate: { gte: start, lte: end } },
              {
                status: { in: ['NOT_STARTED', 'IN_PROGRESS', 'STAND_BY'] },
                receivedDate: { lte: end },
              },
            ],
          },
          select: {
            estimatedHours: true,
            actualHours: true,
          },
        },
      },
    });

    return analysts.map((analyst) => {
      const estimatedHours = analyst.assignedTasks.reduce(
        (sum, t) => sum + (t.estimatedHours || 0),
        0,
      );
      const actualHours = analyst.assignedTasks.reduce(
        (sum, t) => sum + t.actualHours,
        0,
      );
      return {
        analyst: analyst.name,
        estimatedHours: Math.round(estimatedHours * 100) / 100,
        actualHours: Math.round(actualHours * 100) / 100,
      };
    });
  }

  private async getBucketDistribution(start: Date, end: Date, analystId?: string) {
    const analystFilter = analystId ? { analystId } : {};
    const buckets = await prisma.bucket.findMany({
      include: {
        tasks: {
          where: {
            ...analystFilter,
            receivedDate: { gte: start, lte: end },
          },
          select: { id: true },
        },
      },
    });

    return buckets
      .map((bucket) => ({
        bucket: bucket.name,
        count: bucket.tasks.length,
        color: bucket.color || '#8884d8',
      }))
      .filter((b) => b.count > 0);
  }

  private async getWeeklyTasks(start: Date, end: Date, analystId?: string) {
    const analystFilter = analystId ? { analystId } : {};
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const result: { day: string; received: number; completed: number }[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const [received, completed] = await Promise.all([
        prisma.task.count({
          where: {
            ...analystFilter,
            receivedDate: { gte: dayStart, lte: dayEnd },
          },
        }),
        prisma.task.count({
          where: {
            ...analystFilter,
            actualCompletionDate: { gte: dayStart, lte: dayEnd },
          },
        }),
      ]);

      result.push({
        day: dayNames[d.getDay()],
        received,
        completed,
      });
    }

    return result;
  }

  private async getEfficiency(start: Date, end: Date, analystId?: string) {
    const analystFilter = analystId ? { analystId } : {};
    const tasks = await prisma.task.findMany({
      where: {
        ...analystFilter,
        status: 'COMPLETED',
        actualCompletionDate: { gte: start, lte: end },
      },
      select: {
        estimatedHours: true,
        actualHours: true,
      },
    });

    const estimated = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const actual = tasks.reduce((sum, t) => sum + t.actualHours, 0);
    const ratio = actual > 0 ? Math.round((estimated / actual) * 100) / 100 : 0;

    return {
      estimated: Math.round(estimated * 100) / 100,
      actual: Math.round(actual * 100) / 100,
      ratio,
    };
  }

  private async getOverdueAlerts(analystId?: string) {
    const analystFilter = analystId ? { analystId } : {};
    const now = new Date();
    const tasks = await prisma.task.findMany({
      where: {
        ...analystFilter,
        estimatedCompletionDate: { lt: now },
        status: { in: ['NOT_STARTED', 'IN_PROGRESS', 'STAND_BY'] },
      },
      include: {
        analyst: { select: { name: true } },
      },
      orderBy: { estimatedCompletionDate: 'asc' },
      take: 10,
    });

    return tasks.map((task) => {
      const diffMs = now.getTime() - task.estimatedCompletionDate!.getTime();
      const daysOverdue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        taskId: task.id,
        taskName: task.name,
        analyst: task.analyst?.name ?? 'Nao atribuido',
        daysOverdue,
      };
    });
  }
}

export const dashboardService = new DashboardService();
