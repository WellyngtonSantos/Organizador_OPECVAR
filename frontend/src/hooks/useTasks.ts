import { useState, useCallback, useEffect } from 'react';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task';
import type { FilterParams } from '../types/common';
import * as tasksApi from '../api/tasks';

interface UseTasksReturn {
  tasks: Task[];
  total: number;
  loading: boolean;
  error: string | null;
  fetchTasks: (filters?: FilterParams) => Promise<void>;
  createTask: (data: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
}

export function useTasks(initialFilters?: FilterParams): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (filters?: FilterParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tasksApi.getTasks(filters);
      setTasks(result.data);
      setTotal(result.total);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data: CreateTaskInput): Promise<Task> => {
    setError(null);
    try {
      const task = await tasksApi.createTask(data);
      setTasks((prev) => [task, ...prev]);
      setTotal((prev) => prev + 1);
      return task;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      setError(message);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id: string, data: UpdateTaskInput): Promise<Task> => {
    setError(null);
    try {
      const updated = await tasksApi.updateTask(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      setError(message);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await tasksApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setTotal((prev) => prev - 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      setError(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchTasks(initialFilters);
  }, [fetchTasks, initialFilters]);

  return { tasks, total, loading, error, fetchTasks, createTask, updateTask, deleteTask };
}
