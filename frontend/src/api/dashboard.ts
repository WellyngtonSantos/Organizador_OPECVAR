import apiClient from './client';
import type { WeeklyDashboard } from '../types/dashboard';

export async function getWeeklyDashboard(weekStart: string): Promise<WeeklyDashboard> {
  const response = await apiClient.get('/dashboard/weekly', {
    params: { weekStart },
  });
  return response.data.dashboard;
}
