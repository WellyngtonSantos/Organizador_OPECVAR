export function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(d);
  start.setDate(d.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 4);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function isOverdue(estimatedCompletionDate: Date | null, status: string): boolean {
  if (!estimatedCompletionDate) return false;
  if (status === 'COMPLETED' || status === 'CANCELED') return false;
  return new Date() > new Date(estimatedCompletionDate);
}

export function isNearDeadline(estimatedCompletionDate: Date | null, status: string, days: number = 2): boolean {
  if (!estimatedCompletionDate) return false;
  if (status === 'COMPLETED' || status === 'CANCELED') return false;
  const deadline = new Date(estimatedCompletionDate);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > 0 && diffDays <= days;
}
