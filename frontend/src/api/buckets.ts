import apiClient from './client';
import type { Bucket } from '../types/task';

export interface CreateBucketPayload {
  name: string;
  color?: string | null;
}

export interface UpdateBucketPayload {
  name?: string;
  color?: string | null;
}

export async function getBuckets(): Promise<Bucket[]> {
  const response = await apiClient.get('/buckets');
  return response.data.buckets;
}

export async function createBucket(data: CreateBucketPayload): Promise<Bucket> {
  const response = await apiClient.post('/buckets', data);
  return response.data.bucket;
}

export async function updateBucket(id: string, data: UpdateBucketPayload): Promise<Bucket> {
  const response = await apiClient.put(`/buckets/${id}`, data);
  return response.data.bucket;
}

export async function deleteBucket(id: string): Promise<void> {
  await apiClient.delete(`/buckets/${id}`);
}
