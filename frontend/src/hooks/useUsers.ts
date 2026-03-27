import { useState, useCallback, useEffect } from 'react';
import type { User } from '../types/user';
import * as usersApi from '../api/users';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (data: { name: string; email: string; password: string; role: string }) => Promise<User>;
  updateUser: (id: string, data: { name?: string; email?: string; role?: string; active?: boolean }) => Promise<User>;
  resetPassword: (id: string, password: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await usersApi.getAllUsers();
      setUsers(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar usuarios';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: { name: string; email: string; password: string; role: string }) => {
    const user = await usersApi.createUser(data);
    setUsers((prev) => [...prev, user]);
    return user;
  }, []);

  const updateUser = useCallback(async (id: string, data: { name?: string; email?: string; role?: string; active?: boolean }) => {
    const updated = await usersApi.updateUser(id, data);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    return updated;
  }, []);

  const resetPassword = useCallback(async (id: string, password: string) => {
    await usersApi.resetPassword(id, password);
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    await usersApi.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, fetchUsers, createUser, updateUser, resetPassword, deleteUser };
}
