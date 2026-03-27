import apiClient from './client';
import type { Label } from '../types/task';

export interface CreateLabelPayload {
  name: string;
  color?: string | null;
}

export interface UpdateLabelPayload {
  name?: string;
  color?: string | null;
}

export async function getLabels(): Promise<Label[]> {
  const response = await apiClient.get('/labels');
  return response.data.labels;
}

export async function createLabel(data: CreateLabelPayload): Promise<Label> {
  const response = await apiClient.post('/labels', data);
  return response.data.label;
}

export async function updateLabel(id: string, data: UpdateLabelPayload): Promise<Label> {
  const response = await apiClient.put(`/labels/${id}`, data);
  return response.data.label;
}

export async function deleteLabel(id: string): Promise<void> {
  await apiClient.delete(`/labels/${id}`);
}
