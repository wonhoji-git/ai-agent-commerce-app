/**
 * API Types
 *
 * API 요청/응답 관련 타입 정의
 */

/** API 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
  metadata?: {
    timestamp: string;
    request_id: string;
  };
}

/** API 오류 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/** 페이지네이션 요청 */
export interface PaginationRequest {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/** 페이지네이션 응답 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/** 상태 응답 */
export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  uptime: number;
  services: {
    name: string;
    status: "up" | "down";
  }[];
}
