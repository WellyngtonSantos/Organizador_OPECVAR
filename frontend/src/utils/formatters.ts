import { Priority, Status } from '../types/task';

export function formatHours(hours: number | null): string {
  if (hours === null || hours === undefined) return '-';
  return `${hours.toFixed(1)}h`;
}

export const statusLabels: Record<Status, string> = {
  [Status.NOT_STARTED]: 'Nao Iniciado',
  [Status.IN_PROGRESS]: 'Em Andamento',
  [Status.STAND_BY]: 'Stand-by',
  [Status.COMPLETED]: 'Concluida',
  [Status.CANCELED]: 'Cancelada',
};

export const priorityLabels: Record<Priority, string> = {
  [Priority.LOW]: 'Baixa',
  [Priority.MEDIUM]: 'Media',
  [Priority.HIGH]: 'Alta',
  [Priority.URGENT]: 'Urgente',
};

export const statusColors: Record<Status, string> = {
  [Status.NOT_STARTED]: '#9e9e9e',
  [Status.IN_PROGRESS]: '#1976d2',
  [Status.STAND_BY]: '#f57c00',
  [Status.COMPLETED]: '#388e3c',
  [Status.CANCELED]: '#d32f2f',
};

export const priorityColors: Record<Priority, string> = {
  [Priority.LOW]: '#9e9e9e',
  [Priority.MEDIUM]: '#1976d2',
  [Priority.HIGH]: '#f57c00',
  [Priority.URGENT]: '#d32f2f',
};
