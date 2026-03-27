import { useState, useCallback, useEffect, useRef } from 'react';
import type { TimerSession } from '../types/task';
import * as timerApi from '../api/timer';

interface UseTimerReturn {
  activeSession: TimerSession | null;
  elapsed: number;
  loading: boolean;
  error: string | null;
  startTimer: (taskId: string) => Promise<TimerSession>;
  stopTimer: () => Promise<TimerSession>;
  fetchActiveTimer: () => Promise<void>;
  sessions: TimerSession[];
  sessionsLoading: boolean;
  fetchSessions: (taskId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
}

export function useTimer(): UseTimerReturn {
  const [activeSession, setActiveSession] = useState<TimerSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const updateElapsed = useCallback(() => {
    if (activeSession && !activeSession.stoppedAt) {
      const start = new Date(activeSession.startedAt).getTime();
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    }
  }, [activeSession]);

  useEffect(() => {
    if (activeSession && !activeSession.stoppedAt) {
      updateElapsed();
      intervalRef.current = window.setInterval(updateElapsed, 1000);
    } else {
      setElapsed(0);
    }
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeSession, updateElapsed]);

  const fetchActiveTimer = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await timerApi.getActiveTimer();
      setActiveSession(session);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch active timer';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const startTimer = useCallback(async (taskId: string): Promise<TimerSession> => {
    setError(null);
    try {
      const session = await timerApi.startTimer(taskId);
      setActiveSession(session);
      return session;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start timer';
      setError(message);
      throw err;
    }
  }, []);

  const stopTimer = useCallback(async (): Promise<TimerSession> => {
    if (!activeSession) throw new Error('No active timer');
    setError(null);
    try {
      const session = await timerApi.stopTimer(activeSession.id);
      setActiveSession(null);
      return session;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to stop timer';
      setError(message);
      throw err;
    }
  }, [activeSession]);

  const fetchSessions = useCallback(async (taskId: string) => {
    setSessionsLoading(true);
    try {
      const result = await timerApi.getTaskTimerSessions(taskId);
      setSessions(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(message);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    setError(null);
    try {
      await timerApi.deleteTimerSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete session';
      setError(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchActiveTimer();
  }, [fetchActiveTimer]);

  return {
    activeSession,
    elapsed,
    loading,
    error,
    startTimer,
    stopTimer,
    fetchActiveTimer,
    sessions,
    sessionsLoading,
    fetchSessions,
    deleteSession,
  };
}
