import dayjs from 'dayjs';

export function formatDate(date: string | null): string {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY');
}

export function formatDateTime(date: string | null): string {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

export function getMonday(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getFriday(monday: Date): Date {
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);
  return friday;
}

export function isOverdue(estimatedCompletionDate: string | null, status: string): boolean {
  if (!estimatedCompletionDate) return false;
  if (status === 'COMPLETED' || status === 'CANCELED') return false;
  return new Date() > new Date(estimatedCompletionDate);
}

export function isNearDeadline(estimatedCompletionDate: string | null, status: string, days: number = 2): boolean {
  if (!estimatedCompletionDate) return false;
  if (status === 'COMPLETED' || status === 'CANCELED') return false;
  const deadline = new Date(estimatedCompletionDate);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > 0 && diffDays <= days;
}

export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
