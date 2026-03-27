import apiClient from './client';
import type { TimerSession } from '../types/task';

export async function getActiveTimer(): Promise<TimerSession | null> {
  const response = await apiClient.get('/timers/active');
  return response.data.session;
}

export async function startTimer(taskId: string): Promise<TimerSession> {
  const response = await apiClient.post('/timers/start', { taskId });
  return response.data.session;
}

export async function stopTimer(sessionId: string): Promise<TimerSession> {
  const response = await apiClient.post(`/timers/${sessionId}/stop`);
  return response.data.session;
}

export async function getTaskTimerSessions(taskId: string): Promise<TimerSession[]> {
  const response = await apiClient.get(`/timers/task/${taskId}`);
  return response.data.sessions;
}

export async function deleteTimerSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/timers/${sessionId}`);
}
