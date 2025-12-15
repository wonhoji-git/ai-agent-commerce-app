/**
 * Agent Types
 *
 * AI 에이전트 관련 타입 정의
 */

/** 에이전트 코드 */
export type AgentCode =
  | "SUPERVISOR"
  | "MD"
  | "CS"
  | "DISPLAY"
  | "PURCHASE"
  | "LOGISTICS"
  | "MARKETING";

/** 에이전트 정보 */
export interface AgentInfo {
  code: AgentCode;
  name: string;
  description: string;
  color: string;
}

/** 에이전트 설정 */
export const AGENT_CONFIG: Record<AgentCode, AgentInfo> = {
  SUPERVISOR: {
    code: "SUPERVISOR",
    name: "슈퍼바이저",
    description: "전체 작업을 조율하고 분배합니다",
    color: "#6366F1",
  },
  MD: {
    code: "MD",
    name: "MD",
    description: "상품 등록 및 관리를 담당합니다",
    color: "#8B5CF6",
  },
  CS: {
    code: "CS",
    name: "CS",
    description: "고객 문의 응대를 담당합니다",
    color: "#06B6D4",
  },
  DISPLAY: {
    code: "DISPLAY",
    name: "전시",
    description: "상품 전시 및 배치를 담당합니다",
    color: "#F59E0B",
  },
  PURCHASE: {
    code: "PURCHASE",
    name: "결제",
    description: "결제 및 주문 처리를 담당합니다",
    color: "#10B981",
  },
  LOGISTICS: {
    code: "LOGISTICS",
    name: "물류",
    description: "배송 및 재고 관리를 담당합니다",
    color: "#EF4444",
  },
  MARKETING: {
    code: "MARKETING",
    name: "마케팅",
    description: "캠페인 및 프로모션을 담당합니다",
    color: "#EC4899",
  },
};

/** 승인 유형 */
export type ApprovalType =
  | "PRICE_CONFIRMATION"
  | "PRODUCT_APPROVAL"
  | "CAMPAIGN_APPROVAL"
  | "CS_RESPONSE_APPROVAL"
  | "HIGH_VALUE_ORDER"
  | "GENERAL";

/** 승인 상태 */
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "MODIFIED";

/** 승인 요청 */
export interface ApprovalRequest {
  approval_id: string;
  thread_id: string;
  type: ApprovalType;
  agent: AgentCode;
  data: Record<string, unknown>;
  status: ApprovalStatus;
  created_at: string;
  expires_at?: string;
}

/** 승인 응답 */
export interface ApprovalResponse {
  approval_id: string;
  decision: ApprovalStatus;
  modifications?: Record<string, unknown>;
  comment?: string;
  responded_at: string;
}

/** 에이전트 실행 요청 */
export interface AgentExecuteRequest {
  request: string;
  context?: {
    images?: string[];
    seller_no?: number;
    [key: string]: unknown;
  };
}

/** 에이전트 실행 응답 */
export interface AgentExecuteResponse {
  thread_id: string;
  status: "accepted" | "rejected";
  message?: string;
}
