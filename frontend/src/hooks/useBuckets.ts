import { useState, useCallback, useEffect } from 'react';
import type { Bucket } from '../types/task';
import * as bucketsApi from '../api/buckets';
import type { CreateBucketPayload, UpdateBucketPayload } from '../api/buckets';

interface UseBucketsReturn {
  buckets: Bucket[];
  loading: boolean;
  error: string | null;
  fetchBuckets: () => Promise<void>;
  createBucket: (data: CreateBucketPayload) => Promise<Bucket>;
  updateBucket: (id: string, data: UpdateBucketPayload) => Promise<Bucket>;
  deleteBucket: (id: string) => Promise<void>;
}

export function useBuckets(): UseBucketsReturn {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBuckets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await bucketsApi.getBuckets();
      setBuckets(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch buckets';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBucket = useCallback(async (data: CreateBucketPayload): Promise<Bucket> => {
    setError(null);
    try {
      const bucket = await bucketsApi.createBucket(data);
      setBuckets((prev) => [...prev, bucket]);
      return bucket;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create bucket';
      setError(message);
      throw err;
    }
  }, []);

  const updateBucket = useCallback(async (id: string, data: UpdateBucketPayload): Promise<Bucket> => {
    setError(null);
    try {
      const updated = await bucketsApi.updateBucket(id, data);
      setBuckets((prev) => prev.map((b) => (b.id === id ? updated : b)));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update bucket';
      setError(message);
      throw err;
    }
  }, []);

  const deleteBucket = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await bucketsApi.deleteBucket(id);
      setBuckets((prev) => prev.filter((b) => b.id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete bucket';
      setError(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchBuckets();
  }, [fetchBuckets]);

  return { buckets, loading, error, fetchBuckets, createBucket, updateBucket, deleteBucket };
}
