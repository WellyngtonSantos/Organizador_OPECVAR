import { useState, useCallback, useEffect } from 'react';
import type { Suggestion } from '../types/suggestion';
import * as suggestionsApi from '../api/suggestions';

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await suggestionsApi.getAllSuggestions();
      setSuggestions(result);
    } catch {
      setError('Erro ao carregar sugestoes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSuggestion = useCallback(async (data: { title: string; description: string }) => {
    const suggestion = await suggestionsApi.createSuggestion(data);
    setSuggestions((prev) => [suggestion, ...prev]);
    return suggestion;
  }, []);

  const updateSuggestion = useCallback(async (id: string, data: { status?: string; adminNote?: string | null }) => {
    const updated = await suggestionsApi.updateSuggestion(id, data);
    setSuggestions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, []);

  const deleteSuggestion = useCallback(async (id: string) => {
    await suggestionsApi.deleteSuggestion(id);
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return { suggestions, loading, error, fetchSuggestions, createSuggestion, updateSuggestion, deleteSuggestion };
}
