/**
 * Agent API
 *
 * 에이전트 실행 관련 API 함수
 */

import apiClient from "./client";
import type { ApiResponse } from "@/types/api";
import type {
  AgentExecuteRequest,
  AgentExecuteResponse,
  ConversationHistoryResponse,
  ResumeConversationRequest,
  ResumeConversationResponse,
} from "@/types/agent";

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

/**
 * Get conversation history for a thread
 * 특정 thread의 대화 히스토리 조회
 */
export async function getConversationHistory(
  threadId: string
): Promise<ConversationHistoryResponse> {
  const response = await apiClient.get<ApiResponse<ConversationHistoryResponse>>(
    `/agents/history/${threadId}`
  );
  return response.data.data;
}

/**
 * Resume a conversation
 * 중단된 대화 재개 (승인 처리 후 워크플로우 재시작 등)
 */
export async function resumeConversation(
  request: ResumeConversationRequest
): Promise<ResumeConversationResponse> {
  const response = await apiClient.post<ApiResponse<ResumeConversationResponse>>(
    "/agents/resume",
    request
  );
  return response.data.data;
}
