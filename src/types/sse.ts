/**
 * SSE Event Types
 *
 * Server-Sent Events 관련 타입 정의
 */

import type { AgentCode, ApprovalRequest } from "./agent";

/** SSE 이벤트 타입 */
export type SSEEventType =
  | "connected"
  | "thought"
  | "reasoning"
  | "agent_started"
  | "agent_progress"
  | "agent_completed"
  | "agent_failed"
  | "subagent_started"
  | "subagent_completed"
  | "step_started"
  | "step_completed"
  | "approval_required"
  | "complete"
  | "error"
  | "heartbeat";

/** 기본 SSE 이벤트 */
export interface BaseSSEEvent {
  event: SSEEventType;
  thread_id: string;
  timestamp: string;
}

/** 연결 이벤트 */
export interface ConnectedEvent extends BaseSSEEvent {
  event: "connected";
}

/** 사고 과정 이벤트 */
export interface ThoughtEvent extends BaseSSEEvent {
  event: "thought";
  data: {
    agent: AgentCode;
    thought: string;
    next_agent?: AgentCode;
  };
}

/** 에이전트 시작 이벤트 */
export interface AgentStartedEvent extends BaseSSEEvent {
  event: "agent_started";
  data: {
    agent: AgentCode;
    task: string;
  };
}

/** 에이전트 진행 이벤트 */
export interface AgentProgressEvent extends BaseSSEEvent {
  event: "agent_progress";
  data: {
    agent: AgentCode;
    step: string;
    progress: number;
    message: string;
  };
}

/** 에이전트 완료 이벤트 */
export interface AgentCompletedEvent extends BaseSSEEvent {
  event: "agent_completed";
  data: {
    agent: AgentCode;
    result: Record<string, unknown>;
    confidence: number;
    duration_ms: number;
  };
}

/** 에이전트 실패 이벤트 */
export interface AgentFailedEvent extends BaseSSEEvent {
  event: "agent_failed";
  data: {
    agent: AgentCode;
    error: string;
    recoverable: boolean;
  };
}

/** 스텝 완료 이벤트 */
export interface StepCompletedEvent extends BaseSSEEvent {
  event: "step_completed";
  data: {
    agent: AgentCode;
    step: string;
    result?: Record<string, unknown>;
  };
}

/** 승인 요청 이벤트 */
export interface ApprovalRequiredEvent extends BaseSSEEvent {
  event: "approval_required";
  data: ApprovalRequest;
}

/** 완료 이벤트 */
export interface CompleteEvent extends BaseSSEEvent {
  event: "complete";
  data: {
    summary: string;
    details?: Record<string, unknown>;
    total_time_ms: number;
  };
}

/** 오류 이벤트 */
export interface ErrorEvent extends BaseSSEEvent {
  event: "error";
  data: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}

/** 하트비트 이벤트 */
export interface HeartbeatEvent extends BaseSSEEvent {
  event: "heartbeat";
}

/** 모든 SSE 이벤트 유니온 */
export type SSEEvent =
  | ConnectedEvent
  | ThoughtEvent
  | AgentStartedEvent
  | AgentProgressEvent
  | AgentCompletedEvent
  | AgentFailedEvent
  | StepCompletedEvent
  | ApprovalRequiredEvent
  | CompleteEvent
  | ErrorEvent
  | HeartbeatEvent;

/** SSE 연결 상태 */
export interface SSEConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectCount: number;
  lastEventTime: string | null;
  error: string | null;
}
