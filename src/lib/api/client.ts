/**
 * API Client
 *
 * Axios 기반 API 클라이언트
 */

import axios, { type AxiosInstance, type AxiosError } from "axios";
import type { ApiResponse, ApiError } from "@/types/api";

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== "undefined"
      ? localStorage.getItem("auth_token")
      : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers["X-Request-ID"] = generateRequestId();

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    // Handle common errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            // window.location.href = "/login";
          }
          break;
        case 403:
          console.error("Forbidden:", data?.error?.message);
          break;
        case 404:
          console.error("Not found:", data?.error?.message);
          break;
        case 500:
          console.error("Server error:", data?.error?.message);
          break;
      }
    } else if (error.request) {
      // Network error
      console.error("Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Helper: Generate request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Export types for API responses
export type { ApiResponse, ApiError };

// Export the client
export default apiClient;

// Named export for flexibility
export { apiClient };
