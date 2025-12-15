# 02. API Client & Type Definitions

## Overview

Axios 기반 API 클라이언트를 구성하고 TypeScript 타입을 정의합니다.
TanStack Query를 사용하여 서버 상태를 관리합니다.

---

## Step 1: Type Definitions

### `src/types/agent.ts`

```typescript
/**
 * Agent Types for AI Agent Commerce
 */

// Agent Codes
export type AgentCode =
  | "SUPERVISOR"
  | "MD"
  | "CS"
  | "DISPLAY"
  | "PURCHASE"
  | "LOGISTICS"
  | "MARKETING";

// Agent Type
export type AgentType = "SUPERVISOR" | "SUBAGENT";

// Agent Status
export type AgentStatus =
  | "IDLE"
  | "STARTED"
  | "IN_PROGRESS"
  | "WAITING_APPROVAL"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

// Approval Status
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "MODIFIED";

// Approval Type
export type ApprovalType =
  | "PRICE_CONFIRMATION"
  | "PRODUCT_APPROVAL"
  | "CAMPAIGN_APPROVAL"
  | "CS_RESPONSE_APPROVAL"
  | "HIGH_VALUE_ORDER"
  | "GENERAL";

// Priority Level
export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// Agent Info
export interface Agent {
  code: AgentCode;
  name: string;
  type: AgentType;
  status?: AgentStatus;
}

// Agent Execution Request
export interface AgentExecuteRequest {
  request: string;
  context?: {
    images?: string[];
    additional_info?: Record<string, unknown>;
  };
  priority?: PriorityLevel;
}

// Agent Execution Response
export interface AgentExecuteResponse {
  thread_id: string;
  status: AgentStatus;
  estimated_completion?: string;
  stream_url: string;
}

// Agent Status Response
export interface AgentStatusResponse {
  thread_id: string;
  status: AgentStatus;
  current_agent: AgentCode | null;
  current_step: string | null;
  progress_percent: number;
  started_at: string;
  agent_results: Record<AgentCode, AgentResult>;
  pending_approval: ApprovalRequest | null;
}

// Agent Result
export interface AgentResult {
  status: AgentStatus;
  steps_completed: string[];
  steps_remaining: string[];
  data?: Record<string, unknown>;
  confidence?: number;
  error?: string;
}

// Agent History Item
export interface AgentHistoryItem {
  thread_id: string;
  request_summary: string;
  status: AgentStatus;
  agents_used: AgentCode[];
  started_at: string;
  completed_at: string | null;
  result_summary: string | null;
}

// Approval Request
export interface ApprovalRequest {
  approval_id: string;
  thread_id: string;
  type: ApprovalType;
  status: ApprovalStatus;
  agent: AgentCode;
  data: Record<string, unknown>;
  options: ApprovalOption[];
  created_at: string;
  expires_at?: string;
}

// Approval Option
export interface ApprovalOption {
  label: string;
  value: string;
  description?: string;
}

// Approval Response Request
export interface ApprovalResponseRequest {
  approval_id: string;
  decision: "APPROVED" | "REJECTED" | "MODIFIED";
  modifications?: Record<string, unknown>;
  comment?: string;
}

// Agent Complete Result
export interface AgentCompleteResult {
  thread_id: string;
  final_result: {
    summary: string;
    [key: string]: unknown;
  };
  total_time_ms: number;
}
```

### `src/types/sse.ts`

```typescript
/**
 * SSE Event Types for AI Agent Commerce
 */

import type { AgentCode, ApprovalRequest } from "./agent";

// SSE Event Types
export type SSEEventType =
  | "thought"
  | "agent_start"
  | "progress"
  | "agent_complete"
  | "approval_required"
  | "complete"
  | "error"
  | "heartbeat";

// Base SSE Event
export interface BaseSSEEvent {
  event_type: SSEEventType;
  event_id: string;
  timestamp: string;
}

// Thought Event (Supervisor reasoning)
export interface ThoughtEvent extends BaseSSEEvent {
  event_type: "thought";
  data: {
    agent: AgentCode;
    thought: string;
    next_agent?: AgentCode;
    reasoning?: string;
  };
}

// Agent Start Event
export interface AgentStartEvent extends BaseSSEEvent {
  event_type: "agent_start";
  data: {
    agent: AgentCode;
    task: string;
    expected_duration_ms?: number;
  };
}

// Progress Event
export interface ProgressEvent extends BaseSSEEvent {
  event_type: "progress";
  data: {
    agent: AgentCode;
    step: string;
    progress: number; // 0-100
    message: string;
  };
}

// Agent Complete Event
export interface AgentCompleteEvent extends BaseSSEEvent {
  event_type: "agent_complete";
  data: {
    agent: AgentCode;
    result: Record<string, unknown>;
    confidence: number;
    duration_ms: number;
  };
}

// Approval Required Event
export interface ApprovalRequiredEvent extends BaseSSEEvent {
  event_type: "approval_required";
  data: ApprovalRequest;
}

// Complete Event
export interface CompleteEvent extends BaseSSEEvent {
  event_type: "complete";
  data: {
    thread_id: string;
    final_result: {
      summary: string;
      [key: string]: unknown;
    };
    total_time_ms: number;
  };
}

// Error Event
export interface ErrorEvent extends BaseSSEEvent {
  event_type: "error";
  data: {
    code: string;
    message: string;
    recoverable: boolean;
    agent?: AgentCode;
  };
}

// Heartbeat Event
export interface HeartbeatEvent extends BaseSSEEvent {
  event_type: "heartbeat";
  data: {
    status: "connected";
  };
}

// Union type for all SSE events
export type SSEEvent =
  | ThoughtEvent
  | AgentStartEvent
  | ProgressEvent
  | AgentCompleteEvent
  | ApprovalRequiredEvent
  | CompleteEvent
  | ErrorEvent
  | HeartbeatEvent;

// Parsed SSE Message
export interface ParsedSSEMessage {
  id: string;
  event: SSEEventType;
  data: Record<string, unknown>;
  retry?: number;
}
```

### `src/types/chat.ts`

```typescript
/**
 * Chat UI Types for AI Agent Commerce
 */

import type { AgentCode, ApprovalRequest } from "./agent";
import type { SSEEvent } from "./sse";

// Message Role
export type MessageRole = "user" | "assistant" | "system";

// Message Type
export type MessageType =
  | "user_input"
  | "thought"
  | "agent_status"
  | "progress"
  | "approval"
  | "result"
  | "error"
  | "info";

// Base Message
export interface BaseMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  timestamp: string;
}

// User Input Message
export interface UserInputMessage extends BaseMessage {
  type: "user_input";
  role: "user";
  content: string;
  attachments?: Attachment[];
}

// Thought Message (Supervisor reasoning)
export interface ThoughtMessage extends BaseMessage {
  type: "thought";
  role: "assistant";
  agent: AgentCode;
  thought: string;
  next_agent?: AgentCode;
}

// Agent Status Message
export interface AgentStatusMessage extends BaseMessage {
  type: "agent_status";
  role: "assistant";
  agent: AgentCode;
  status: "started" | "completed" | "failed";
  task?: string;
  result?: Record<string, unknown>;
  confidence?: number;
  duration_ms?: number;
}

// Progress Message
export interface ProgressMessage extends BaseMessage {
  type: "progress";
  role: "assistant";
  agent: AgentCode;
  step: string;
  progress: number;
  message: string;
}

// Approval Message
export interface ApprovalMessage extends BaseMessage {
  type: "approval";
  role: "assistant";
  approval: ApprovalRequest;
  responded?: boolean;
  response?: {
    decision: string;
    modifications?: Record<string, unknown>;
  };
}

// Result Message
export interface ResultMessage extends BaseMessage {
  type: "result";
  role: "assistant";
  thread_id: string;
  summary: string;
  details?: Record<string, unknown>;
  total_time_ms: number;
}

// Error Message
export interface ErrorMessage extends BaseMessage {
  type: "error";
  role: "system";
  code: string;
  message: string;
  recoverable: boolean;
}

// Info Message
export interface InfoMessage extends BaseMessage {
  type: "info";
  role: "system";
  content: string;
}

// Union type for all messages
export type ChatMessage =
  | UserInputMessage
  | ThoughtMessage
  | AgentStatusMessage
  | ProgressMessage
  | ApprovalMessage
  | ResultMessage
  | ErrorMessage
  | InfoMessage;

// Attachment
export interface Attachment {
  id: string;
  type: "image" | "file";
  name: string;
  url: string;
  size?: number;
}

// Chat Session
export interface ChatSession {
  id: string;
  thread_id: string | null;
  seller_no: number;
  status: "idle" | "executing" | "waiting_approval" | "completed" | "error";
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// Chat Input State
export interface ChatInputState {
  text: string;
  attachments: Attachment[];
  isSubmitting: boolean;
}
```

### `src/types/api.ts`

```typescript
/**
 * API Response Types
 */

// Pagination Meta
export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  total_pages: number;
}

// Response Meta
export interface ResponseMeta {
  timestamp: string;
  request_id?: string;
  pagination?: PaginationMeta;
}

// Error Detail
export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown> | Array<{ field: string; message: string }>;
}

// API Response
export interface APIResponse<T = unknown> {
  success: boolean;
  data: T | null;
  meta: ResponseMeta;
  error: ErrorDetail | null;
}

// Paginated Response
export interface PaginatedResponse<T> extends APIResponse<T[]> {
  meta: ResponseMeta & {
    pagination: PaginationMeta;
  };
}
```

---

## Step 2: API Client Setup

### `src/lib/api/client.ts`

```typescript
/**
 * Axios API Client
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import type { APIResponse, ErrorDetail } from "@/types/api";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const TEST_SELLER_NO = process.env.NEXT_PUBLIC_TEST_SELLER_NO || "1";

// Create Axios instance
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
    // Add seller_no for testing (no auth required)
    if (config.params) {
      config.params.seller_no = config.params.seller_no || TEST_SELLER_NO;
    } else {
      config.params = { seller_no: TEST_SELLER_NO };
    }

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] Response:`, response.data);
    }
    return response;
  },
  (error: AxiosError<APIResponse>) => {
    // Handle error response
    const errorDetail: ErrorDetail = error.response?.data?.error || {
      code: "NETWORK_ERROR",
      message: error.message || "Network error occurred",
    };

    if (process.env.NODE_ENV === "development") {
      console.error(`[API] Error:`, errorDetail);
    }

    return Promise.reject(errorDetail);
  }
);

// Helper function for GET requests
export async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.get<APIResponse<T>>(url, config);
  if (!response.data.success) {
    throw response.data.error;
  }
  return response.data.data as T;
}

// Helper function for POST requests
export async function post<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<APIResponse<T>>(url, data, config);
  if (!response.data.success) {
    throw response.data.error;
  }
  return response.data.data as T;
}

// Helper function for PUT requests
export async function put<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.put<APIResponse<T>>(url, data, config);
  if (!response.data.success) {
    throw response.data.error;
  }
  return response.data.data as T;
}

// Helper function for DELETE requests
export async function del<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.delete<APIResponse<T>>(url, config);
  if (!response.data.success) {
    throw response.data.error;
  }
  return response.data.data as T;
}

// Get API base URL (for SSE connections)
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

// Get test seller number
export function getTestSellerNo(): number {
  return parseInt(TEST_SELLER_NO, 10);
}

export default apiClient;
```

### `src/lib/api/agents.ts`

```typescript
/**
 * Agent API Functions
 */

import { get, post, getApiBaseUrl, getTestSellerNo } from "./client";
import type {
  Agent,
  AgentExecuteRequest,
  AgentExecuteResponse,
  AgentStatusResponse,
  AgentHistoryItem,
  ApprovalResponseRequest,
} from "@/types/agent";

// List all agents
export async function listAgents(): Promise<{ agents: Agent[] }> {
  return get<{ agents: Agent[] }>("/agents");
}

// Get agent details
export async function getAgent(agentCode: string): Promise<Agent> {
  return get<Agent>(`/agents/${agentCode}`);
}

// Execute agent
export async function executeAgent(
  request: AgentExecuteRequest
): Promise<AgentExecuteResponse> {
  return post<AgentExecuteResponse, AgentExecuteRequest>(
    "/agents/execute",
    request
  );
}

// Get agent status
export async function getAgentStatus(
  threadId: string
): Promise<AgentStatusResponse> {
  return get<AgentStatusResponse>(`/agents/status/${threadId}`);
}

// Approve agent decision
export async function approveAgent(
  threadId: string,
  response: ApprovalResponseRequest
): Promise<{ success: boolean; message: string }> {
  return post<{ success: boolean; message: string }, ApprovalResponseRequest>(
    `/agents/${threadId}/approve`,
    response
  );
}

// Cancel agent execution
export async function cancelAgent(
  threadId: string
): Promise<{ success: boolean; message: string }> {
  return post<{ success: boolean; message: string }>(
    `/agents/${threadId}/cancel`
  );
}

// Get agent history
export async function getAgentHistory(params?: {
  page?: number;
  size?: number;
  status?: string;
  agent?: string;
  from_date?: string;
  to_date?: string;
}): Promise<AgentHistoryItem[]> {
  return get<AgentHistoryItem[]>("/agents/history", { params });
}

// Get SSE stream URL
export function getAgentStreamUrl(threadId: string): string {
  const baseUrl = getApiBaseUrl();
  const sellerNo = getTestSellerNo();
  return `${baseUrl}/sse/agent/${threadId}?seller_no=${sellerNo}`;
}

// Get seller events stream URL
export function getSellerStreamUrl(): string {
  const baseUrl = getApiBaseUrl();
  const sellerNo = getTestSellerNo();
  return `${baseUrl}/sse/seller/${sellerNo}`;
}

// Get approvals stream URL
export function getApprovalsStreamUrl(): string {
  const baseUrl = getApiBaseUrl();
  const sellerNo = getTestSellerNo();
  return `${baseUrl}/sse/approvals/${sellerNo}`;
}
```

### `src/lib/api/approvals.ts`

```typescript
/**
 * Approval API Functions
 */

import { get, post } from "./client";
import type { ApprovalRequest, ApprovalResponseRequest } from "@/types/agent";

// Get pending approvals
export async function getPendingApprovals(): Promise<ApprovalRequest[]> {
  return get<ApprovalRequest[]>("/approvals/pending");
}

// Get approval details
export async function getApproval(
  approvalId: string
): Promise<ApprovalRequest> {
  return get<ApprovalRequest>(`/approvals/${approvalId}`);
}

// Approve
export async function approve(
  approvalId: string,
  modifications?: Record<string, unknown>,
  comment?: string
): Promise<{ success: boolean; message: string }> {
  const request: ApprovalResponseRequest = {
    approval_id: approvalId,
    decision: "APPROVED",
    modifications,
    comment,
  };
  return post<{ success: boolean; message: string }, ApprovalResponseRequest>(
    `/approvals/${approvalId}/approve`,
    request
  );
}

// Reject
export async function reject(
  approvalId: string,
  comment?: string
): Promise<{ success: boolean; message: string }> {
  const request: ApprovalResponseRequest = {
    approval_id: approvalId,
    decision: "REJECTED",
    comment,
  };
  return post<{ success: boolean; message: string }, ApprovalResponseRequest>(
    `/approvals/${approvalId}/reject`,
    request
  );
}

// Modify and approve
export async function modifyAndApprove(
  approvalId: string,
  modifications: Record<string, unknown>,
  comment?: string
): Promise<{ success: boolean; message: string }> {
  const request: ApprovalResponseRequest = {
    approval_id: approvalId,
    decision: "MODIFIED",
    modifications,
    comment,
  };
  return post<{ success: boolean; message: string }, ApprovalResponseRequest>(
    `/approvals/${approvalId}/approve`,
    request
  );
}
```

### `src/lib/api/types.ts`

```typescript
/**
 * Re-export all types for convenient importing
 */

export * from "@/types/agent";
export * from "@/types/chat";
export * from "@/types/sse";
export * from "@/types/api";
```

---

## Step 3: TanStack Query Hooks

### `src/lib/hooks/useAgentQuery.ts`

```typescript
/**
 * TanStack Query hooks for Agent API
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as agentApi from "@/lib/api/agents";
import type { AgentExecuteRequest, ApprovalResponseRequest } from "@/types/agent";

// Query keys
export const agentKeys = {
  all: ["agents"] as const,
  lists: () => [...agentKeys.all, "list"] as const,
  list: () => [...agentKeys.lists()] as const,
  details: () => [...agentKeys.all, "detail"] as const,
  detail: (code: string) => [...agentKeys.details(), code] as const,
  status: (threadId: string) => [...agentKeys.all, "status", threadId] as const,
  history: (params?: Record<string, unknown>) =>
    [...agentKeys.all, "history", params] as const,
};

// List agents query
export function useAgents() {
  return useQuery({
    queryKey: agentKeys.list(),
    queryFn: agentApi.listAgents,
  });
}

// Get agent status query
export function useAgentStatus(threadId: string | null, enabled = true) {
  return useQuery({
    queryKey: agentKeys.status(threadId || ""),
    queryFn: () => agentApi.getAgentStatus(threadId!),
    enabled: enabled && !!threadId,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

// Get agent history query
export function useAgentHistory(params?: {
  page?: number;
  size?: number;
  status?: string;
  agent?: string;
}) {
  return useQuery({
    queryKey: agentKeys.history(params),
    queryFn: () => agentApi.getAgentHistory(params),
  });
}

// Execute agent mutation
export function useExecuteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AgentExecuteRequest) =>
      agentApi.executeAgent(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.history() });
    },
  });
}

// Approve agent mutation
export function useApproveAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      threadId,
      response,
    }: {
      threadId: string;
      response: ApprovalResponseRequest;
    }) => agentApi.approveAgent(threadId, response),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: agentKeys.status(variables.threadId),
      });
    },
  });
}

// Cancel agent mutation
export function useCancelAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (threadId: string) => agentApi.cancelAgent(threadId),
    onSuccess: (_, threadId) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.status(threadId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.history() });
    },
  });
}
```

---

## Step 4: API Index Export

### `src/lib/api/index.ts`

```typescript
/**
 * API module exports
 */

// Client
export { default as apiClient, get, post, put, del } from "./client";
export { getApiBaseUrl, getTestSellerNo } from "./client";

// Agent API
export * from "./agents";

// Approval API
export * from "./approvals";

// Types
export * from "./types";
```

---

## Verification

API 클라이언트 설정 확인:

```typescript
// src/app/page.tsx 에서 테스트
"use client";

import { useAgents } from "@/lib/hooks/useAgentQuery";

export default function Home() {
  const { data, isLoading, error } = useAgents();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Agents</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

### Expected Behavior
- 백엔드 서버가 실행 중이면 에이전트 목록이 표시됨
- 백엔드가 없으면 Network Error 표시
- 콘솔에 API 요청/응답 로그가 출력됨 (개발 모드)

---

## Next Step

다음 문서 [03_SSE_STREAMING.md](./03_SSE_STREAMING.md)에서 SSE 연동 및 실시간 이벤트 처리를 구현합니다.
