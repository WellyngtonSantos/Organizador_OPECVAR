import { useState, useCallback, useEffect } from 'react';
import type { Label } from '../types/task';
import * as labelsApi from '../api/labels';
import type { CreateLabelPayload, UpdateLabelPayload } from '../api/labels';

interface UseLabelsReturn {
  labels: Label[];
  loading: boolean;
  error: string | null;
  fetchLabels: () => Promise<void>;
  createLabel: (data: CreateLabelPayload) => Promise<Label>;
  updateLabel: (id: string, data: UpdateLabelPayload) => Promise<Label>;
  deleteLabel: (id: string) => Promise<void>;
}

export function useLabels(): UseLabelsReturn {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLabels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await labelsApi.getLabels();
      setLabels(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch labels';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLabel = useCallback(async (data: CreateLabelPayload): Promise<Label> => {
    setError(null);
    try {
      const label = await labelsApi.createLabel(data);
      setLabels((prev) => [...prev, label]);
      return label;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create label';
      setError(message);
      throw err;
    }
  }, []);

  const updateLabel = useCallback(async (id: string, data: UpdateLabelPayload): Promise<Label> => {
    setError(null);
    try {
      const updated = await labelsApi.updateLabel(id, data);
      setLabels((prev) => prev.map((l) => (l.id === id ? updated : l)));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update label';
      setError(message);
      throw err;
    }
  }, []);

  const deleteLabel = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await labelsApi.deleteLabel(id);
      setLabels((prev) => prev.filter((l) => l.id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete label';
      setError(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  return { labels, loading, error, fetchLabels, createLabel, updateLabel, deleteLabel };
}
