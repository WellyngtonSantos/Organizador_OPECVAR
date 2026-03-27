import apiClient from './client';
import type { WeeklyDashboard } from '../types/dashboard';

export async function getWeeklyDashboard(weekStart: string, analystId?: string): Promise<WeeklyDashboard> {
  const params: Record<string, string> = { weekStart };
  if (analystId) params.analystId = analystId;
  const response = await apiClient.get('/dashboard/weekly', { params });
  return response.data.dashboard;
}
