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
  analystId?: string | string[];
  status?: string | string[];
  priority?: string | string[];
  bucketId?: string | string[];
  labelId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
