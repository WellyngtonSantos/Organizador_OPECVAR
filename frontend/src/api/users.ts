import apiClient from './client';
import type { User } from '../types/user';

export async function getAnalysts(): Promise<User[]> {
  const response = await apiClient.get('/users/analysts');
  return response.data.analysts;
}

export async function getAllUsers(): Promise<User[]> {
  const response = await apiClient.get('/users');
  return response.data.users;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<User> {
  const response = await apiClient.post('/users', data);
  return response.data.user;
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; role?: string; active?: boolean },
): Promise<User> {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data.user;
}

export async function resetPassword(id: string, password: string): Promise<void> {
  await apiClient.patch(`/users/${id}/password`, { password });
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
