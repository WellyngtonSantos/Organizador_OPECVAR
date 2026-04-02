import apiClient from './client';
import type { Task, TaskNote, TaskHistory, CreateTaskInput, UpdateTaskInput } from '../types/task';
import type { PaginatedResponse, FilterParams } from '../types/common';

export async function getTasks(params?: FilterParams): Promise<PaginatedResponse<Task>> {
  const queryParams = params ? {
    status: Array.isArray(params.status) ? params.status.join(',') : params.status,
    priority: Array.isArray(params.priority) ? params.priority.join(',') : params.priority,
    bucketId: Array.isArray(params.bucketId) ? params.bucketId.join(',') : params.bucketId,
    analystId: Array.isArray(params.analystId) ? params.analystId.join(',') : params.analystId,
    search: params.search,
    page: params.page,
    limit: params.pageSize,
  } : undefined;
  const response = await apiClient.get('/tasks', { params: queryParams });
  const { tasks, pagination } = response.data;
  return {
    data: tasks,
    total: pagination.total,
    page: pagination.page,
    pageSize: pagination.limit,
  };
}

export async function getTask(id: string): Promise<Task> {
  const response = await apiClient.get(`/tasks/${id}`);
  return response.data.task;
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  const response = await apiClient.post('/tasks', data);
  return response.data.task;
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
  const response = await apiClient.put(`/tasks/${id}`, data);
  return response.data.task;
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}

export async function getTaskNotes(taskId: string): Promise<TaskNote[]> {
  const response = await apiClient.get(`/tasks/${taskId}/notes`);
  return response.data.notes;
}

export async function createTaskNote(taskId: string, content: string): Promise<TaskNote> {
  const response = await apiClient.post(`/tasks/${taskId}/notes`, { content });
  return response.data.note;
}

export async function deleteTaskNote(taskId: string, noteId: string): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}/notes/${noteId}`);
}

export async function getTaskHistory(taskId: string): Promise<TaskHistory[]> {
  const response = await apiClient.get(`/tasks/${taskId}/history`);
  return response.data.history;
}
