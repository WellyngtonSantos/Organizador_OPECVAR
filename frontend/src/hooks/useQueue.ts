import { useState, useCallback } from 'react';
import type { Task } from '../types/task';
import * as queueApi from '../api/queue';

interface UseQueueReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchQueue: (analystId: string) => Promise<void>;
  reorder: (analystId: string, taskIds: string[]) => Promise<void>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export function useQueue(): UseQueueReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async (analystId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await queueApi.getAnalystQueue(analystId);
      setTasks(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch queue';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reorder = useCallback(async (analystId: string, taskIds: string[]) => {
    setError(null);
    try {
      const result = await queueApi.reorderQueue(analystId, taskIds);
      setTasks(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reorder';
      setError(message);
      throw err;
    }
  }, []);

  return { tasks, loading, error, fetchQueue, reorder, setTasks };
}
