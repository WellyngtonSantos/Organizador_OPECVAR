import { useState, useCallback, useEffect } from 'react';
import type { Task, TaskNote, TaskHistory, UpdateTaskInput } from '../types/task';
import * as tasksApi from '../api/tasks';

interface UseTaskReturn {
  task: Task | null;
  loading: boolean;
  error: string | null;
  fetchTask: (id: string) => Promise<void>;
  updateTask: (data: UpdateTaskInput) => Promise<Task>;
  deleteTask: () => Promise<void>;
  notes: TaskNote[];
  notesLoading: boolean;
  addNote: (content: string) => Promise<TaskNote>;
  deleteNote: (noteId: string) => Promise<void>;
  history: TaskHistory[];
  historyLoading: boolean;
  fetchHistory: () => Promise<void>;
}

export function useTask(taskId?: string): UseTaskReturn {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [notes, setNotes] = useState<TaskNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchTask = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tasksApi.getTask(id);
      setTask(result);
      if (result.notes) {
        setNotes(result.notes);
      }
      if (result.history) {
        setHistory(result.history);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch task';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (data: UpdateTaskInput): Promise<Task> => {
    if (!task) throw new Error('No task loaded');
    setError(null);
    try {
      const updated = await tasksApi.updateTask(task.id, data);
      setTask(updated);
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      setError(message);
      throw err;
    }
  }, [task]);

  const deleteTask = useCallback(async (): Promise<void> => {
    if (!task) throw new Error('No task loaded');
    setError(null);
    try {
      await tasksApi.deleteTask(task.id);
      setTask(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      setError(message);
      throw err;
    }
  }, [task]);

  const addNote = useCallback(async (content: string): Promise<TaskNote> => {
    if (!task) throw new Error('No task loaded');
    setError(null);
    try {
      const note = await tasksApi.createTaskNote(task.id, content);
      setNotes((prev) => [...prev, note]);
      return note;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add note';
      setError(message);
      throw err;
    }
  }, [task]);

  const deleteNote = useCallback(async (noteId: string): Promise<void> => {
    if (!task) throw new Error('No task loaded');
    setError(null);
    try {
      await tasksApi.deleteTaskNote(task.id, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete note';
      setError(message);
      throw err;
    }
  }, [task]);

  const fetchHistory = useCallback(async (): Promise<void> => {
    if (!task) return;
    setHistoryLoading(true);
    try {
      const result = await tasksApi.getTaskHistory(task.id);
      setHistory(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch history';
      setError(message);
    } finally {
      setHistoryLoading(false);
    }
  }, [task]);

  useEffect(() => {
    if (taskId) {
      fetchTask(taskId);
    }
  }, [taskId, fetchTask]);

  useEffect(() => {
    if (task && notes.length === 0 && !task.notes) {
      setNotesLoading(true);
      tasksApi.getTaskNotes(task.id)
        .then((result) => setNotes(result))
        .catch(() => { /* error handled silently, user can retry */ })
        .finally(() => setNotesLoading(false));
    }
  }, [task, notes.length]);

  return {
    task,
    loading,
    error,
    fetchTask,
    updateTask,
    deleteTask,
    notes,
    notesLoading,
    addNote,
    deleteNote,
    history,
    historyLoading,
    fetchHistory,
  };
}
