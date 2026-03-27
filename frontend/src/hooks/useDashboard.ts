import { useState, useCallback } from 'react';
import type { WeeklyDashboard } from '../types/dashboard';
import * as dashboardApi from '../api/dashboard';

interface UseDashboardReturn {
  dashboard: WeeklyDashboard | null;
  loading: boolean;
  error: string | null;
  fetchDashboard: (weekStart: string, analystId?: string) => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [dashboard, setDashboard] = useState<WeeklyDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (weekStart: string, analystId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getWeeklyDashboard(weekStart, analystId);
      setDashboard(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dashboard';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { dashboard, loading, error, fetchDashboard };
}
