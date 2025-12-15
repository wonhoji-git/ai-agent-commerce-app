/**
 * Approvals API
 *
 * 승인 워크플로우 관련 API 함수
 */

import apiClient from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { ApprovalRequest, ApprovalResponse } from "@/types/agent";

/**
 * Get pending approvals
 */
export async function getPendingApprovals(): Promise<ApprovalRequest[]> {
  const response = await apiClient.get<ApiResponse<ApprovalRequest[]>>(
    "/approvals/pending"
  );
  return response.data.data;
}

/**
 * Get approval by ID
 */
export async function getApproval(approvalId: string): Promise<ApprovalRequest> {
  const response = await apiClient.get<ApiResponse<ApprovalRequest>>(
    `/approvals/${approvalId}`
  );
  return response.data.data;
}

/**
 * Approve request
 */
export async function approve(
  approvalId: string,
  modifications?: Record<string, unknown>,
  comment?: string
): Promise<ApprovalResponse> {
  const response = await apiClient.post<ApiResponse<ApprovalResponse>>(
    `/approvals/${approvalId}/approve`,
    {
      decision: modifications ? "MODIFIED" : "APPROVED",
      modifications,
      comment,
    }
  );
  return response.data.data;
}

/**
 * Reject request
 */
export async function reject(
  approvalId: string,
  comment?: string
): Promise<ApprovalResponse> {
  const response = await apiClient.post<ApiResponse<ApprovalResponse>>(
    `/approvals/${approvalId}/reject`,
    {
      decision: "REJECTED",
      comment,
    }
  );
  return response.data.data;
}

/**
 * Modify and approve request
 */
export async function modifyAndApprove(
  approvalId: string,
  modifications: Record<string, unknown>,
  comment?: string
): Promise<ApprovalResponse> {
  const response = await apiClient.post<ApiResponse<ApprovalResponse>>(
    `/approvals/${approvalId}/approve`,
    {
      decision: "MODIFIED",
      modifications,
      comment,
    }
  );
  return response.data.data;
}

/**
 * Get approval history
 */
export async function getApprovalHistory(
  options?: {
    page?: number;
    limit?: number;
    status?: string;
  }
): Promise<PaginatedResponse<ApprovalRequest>> {
  const response = await apiClient.get<
    ApiResponse<PaginatedResponse<ApprovalRequest>>
  >("/approvals/history", { params: options });
  return response.data.data;
}
