import apiClient from './client';
import type { Task } from '../types/task';

export async function getAnalystQueue(analystId: string): Promise<Task[]> {
  const response = await apiClient.get(`/queues/${analystId}`);
  return response.data.tasks;
}

export async function reorderQueue(analystId: string, taskIds: string[]): Promise<Task[]> {
  const response = await apiClient.put('/queues/reorder', { analystId, taskIds });
  return response.data.tasks;
}
