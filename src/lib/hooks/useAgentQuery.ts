/**
 * useAgentQuery Hook
 *
 * TanStack Query 기반 에이전트 데이터 패칭
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as agentApi from "@/lib/api/agents";
import * as approvalApi from "@/lib/api/approvals";
import type { AgentExecuteRequest } from "@/types/agent";

// Query keys
export const agentKeys = {
  all: ["agents"] as const,
  history: (options?: Record<string, unknown>) =>
    [...agentKeys.all, "history", options] as const,
  status: (threadId: string) =>
    [...agentKeys.all, "status", threadId] as const,
};

export const approvalKeys = {
  all: ["approvals"] as const,
  pending: () => [...approvalKeys.all, "pending"] as const,
  detail: (id: string) => [...approvalKeys.all, id] as const,
  history: (options?: Record<string, unknown>) =>
    [...approvalKeys.all, "history", options] as const,
};

/**
 * Execute agent mutation
 */
export function useExecuteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AgentExecuteRequest) => agentApi.executeAgent(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
}

/**
 * Get execution status query
 */
export function useExecutionStatus(threadId: string | null) {
  return useQuery({
    queryKey: agentKeys.status(threadId || ""),
    queryFn: () => agentApi.getExecutionStatus(threadId!),
    enabled: !!threadId,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

/**
 * Get execution history query
 */
export function useExecutionHistory(options?: {
  page?: number;
  limit?: number;
  seller_no?: number;
}) {
  return useQuery({
    queryKey: agentKeys.history(options),
    queryFn: () => agentApi.getExecutionHistory(options),
  });
}

/**
 * Cancel execution mutation
 */
export function useCancelExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (threadId: string) => agentApi.cancelExecution(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
}

/**
 * Get pending approvals query
 */
export function usePendingApprovals() {
  return useQuery({
    queryKey: approvalKeys.pending(),
    queryFn: () => approvalApi.getPendingApprovals(),
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

/**
 * Get approval detail query
 */
export function useApprovalDetail(approvalId: string | null) {
  return useQuery({
    queryKey: approvalKeys.detail(approvalId || ""),
    queryFn: () => approvalApi.getApproval(approvalId!),
    enabled: !!approvalId,
  });
}

/**
 * Approve mutation
 */
export function useApprove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      approvalId,
      modifications,
      comment,
    }: {
      approvalId: string;
      modifications?: Record<string, unknown>;
      comment?: string;
    }) => approvalApi.approve(approvalId, modifications, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
    },
  });
}

/**
 * Reject mutation
 */
export function useReject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      approvalId,
      comment,
    }: {
      approvalId: string;
      comment?: string;
    }) => approvalApi.reject(approvalId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
    },
  });
}
