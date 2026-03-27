export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FilterParams {
  analystId?: string;
  status?: string;
  priority?: string;
  bucketId?: string;
  labelId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
