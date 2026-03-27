import { useState, useCallback, useEffect } from 'react';
import type { User } from '../types/user';
import * as usersApi from '../api/users';

interface UseAnalystsReturn {
  analysts: User[];
  loading: boolean;
  error: string | null;
  fetchAnalysts: () => Promise<void>;
}

export function useAnalysts(): UseAnalystsReturn {
  const [analysts, setAnalysts] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await usersApi.getAnalysts();
      setAnalysts(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch analysts';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysts();
  }, [fetchAnalysts]);

  return { analysts, loading, error, fetchAnalysts };
}
