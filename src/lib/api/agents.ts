/**
 * Agent API
 *
 * 에이전트 실행 관련 API 함수
 */

import apiClient from "./client";
import type { ApiResponse } from "@/types/api";
import type { AgentExecuteRequest, AgentExecuteResponse } from "@/types/agent";

/**
 * Execute agent with request
 */
export async function executeAgent(
  request: AgentExecuteRequest
): Promise<AgentExecuteResponse> {
  const response = await apiClient.post<ApiResponse<AgentExecuteResponse>>(
    "/agents/execute",
    request
  );
  return response.data.data;
}

/**
 * Get agent execution status
 */
export async function getExecutionStatus(
  threadId: string
): Promise<{ status: string; progress: number }> {
  const response = await apiClient.get<
    ApiResponse<{ status: string; progress: number }>
  >(`/agents/status/${threadId}`);
  return response.data.data;
}

/**
 * Cancel agent execution
 */
export async function cancelExecution(threadId: string): Promise<void> {
  await apiClient.post(`/agents/cancel/${threadId}`);
}

/**
 * Get execution history
 */
export async function getExecutionHistory(
  options?: {
    page?: number;
    limit?: number;
    seller_no?: number;
  }
): Promise<{
  items: Array<{
    thread_id: string;
    request: string;
    status: string;
    created_at: string;
  }>;
  total: number;
}> {
  const response = await apiClient.get("/agents/history", { params: options });
  return response.data.data;
}

/**
 * Get SSE stream URL for thread
 */
export function getSSEStreamUrl(threadId: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_SSE_BASE_URL || "http://localhost:8000";
  return `${baseUrl}/api/v1/agents/stream/${threadId}`;
}
