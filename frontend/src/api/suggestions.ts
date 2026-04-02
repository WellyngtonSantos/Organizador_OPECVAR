import apiClient from './client';
import type { Suggestion } from '../types/suggestion';

export async function getAllSuggestions(): Promise<Suggestion[]> {
  const response = await apiClient.get('/suggestions');
  return response.data.suggestions;
}

export async function createSuggestion(data: { title: string; description: string }): Promise<Suggestion> {
  const response = await apiClient.post('/suggestions', data);
  return response.data.suggestion;
}

export async function updateSuggestion(
  id: string,
  data: { status?: string; adminNote?: string | null },
): Promise<Suggestion> {
  const response = await apiClient.put(`/suggestions/${id}`, data);
  return response.data.suggestion;
}

export async function deleteSuggestion(id: string): Promise<void> {
  await apiClient.delete(`/suggestions/${id}`);
}
