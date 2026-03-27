import apiClient from './client';
import type { User } from '../types/user';

export async function getAnalysts(): Promise<User[]> {
  const response = await apiClient.get('/users/analysts');
  return response.data.analysts;
}
