/**
 * Chat Types
 *
 * 채팅 메시지 및 세션 관련 타입 정의
 */

import type { AgentCode, ApprovalRequest, ApprovalStatus } from "./agent";

/** 메시지 역할 */
export type MessageRole = "user" | "assistant" | "system";

/** 메시지 타입 */
export type MessageType =
  | "user_input"
  | "thought"
  | "agent_status"
  | "progress"
  | "approval"
  | "result"
  | "error"
  | "info";

/** 기본 메시지 인터페이스 */
export interface BaseMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  timestamp: string;
}

/** 첨부 파일 */
export interface Attachment {
  id: string;
  type: "image" | "file";
  name: string;
  url: string;
  size?: number;
}

/** 사용자 입력 메시지 */
export interface UserInputMessage extends BaseMessage {
  role: "user";
  type: "user_input";
  content: string;
  attachments?: Attachment[];
}

/** 슈퍼바이저 사고 메시지 */
export interface ThoughtMessage extends BaseMessage {
  role: "assistant";
  type: "thought";
  agent: AgentCode;
  thought: string;
  next_agent?: AgentCode;
}

/** 에이전트 상태 메시지 */
export interface AgentStatusMessage extends BaseMessage {
  role: "assistant";
  type: "agent_status";
  agent: AgentCode;
  status: "started" | "completed" | "failed";
  task?: string;
  result?: Record<string, unknown>;
  confidence?: number;
  duration_ms?: number;
}

/** 진행률 메시지 */
export interface ProgressMessage extends BaseMessage {
  role: "assistant";
  type: "progress";
  agent: AgentCode;
  step: string;
  progress: number;
  message: string;
}

/** 승인 요청 메시지 */
export interface ApprovalMessage extends BaseMessage {
  role: "assistant";
  type: "approval";
  approval: ApprovalRequest;
  responded: boolean;
  response?: {
    decision: string;
    modifications?: Record<string, unknown>;
  };
}

/** 결과 메시지 */
export interface ResultMessage extends BaseMessage {
  role: "assistant";
  type: "result";
  thread_id: string;
  summary: string;
  details?: Record<string, unknown>;
  total_time_ms: number;
}

/** 오류 메시지 */
export interface ErrorMessage extends BaseMessage {
  role: "system";
  type: "error";
  code: string;
  message: string;
  recoverable: boolean;
}

/** 정보 메시지 */
export interface InfoMessage extends BaseMessage {
  role: "system";
  type: "info";
  content: string;
}

/** 모든 메시지 타입 유니온 */
export type ChatMessage =
  | UserInputMessage
  | ThoughtMessage
  | AgentStatusMessage
  | ProgressMessage
  | ApprovalMessage
  | ResultMessage
  | ErrorMessage
  | InfoMessage;

/** 채팅 세션 상태 */
export type ChatSessionStatus =
  | "idle"
  | "executing"
  | "waiting_approval"
  | "completed"
  | "error";

/** 채팅 세션 */
export interface ChatSession {
  id: string;
  thread_id: string | null;
  seller_no: number;
  status: ChatSessionStatus;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}
