/**
 * Common API Types
 * Base types used across all API endpoints
 */

/**
 * Standard API response wrapper for successful requests
 */
export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: ResponseMeta;
}

/**
 * API error response structure
 */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Response metadata (pagination, timestamps, etc.)
 */
export interface ResponseMeta {
  pagination?: PaginationMeta;
  timestamp?: string;
  [key: string]: unknown;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  meta: {
    pagination: PaginationMeta;
    [key: string]: unknown;
  };
}

/**
 * Common query parameters for list endpoints
 */
export interface ListParams {
  per_page?: number;
  page?: number;
  sort?: string;
}

/**
 * Union type for all possible API responses
 */
export type ApiResult<T> = ApiResponse<T> | ApiError;
