export interface WeeklyDashboard {
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
