/**
 * useAgentSSE Hook
 *
 * 에이전트 SSE 스트림 연결 및 이벤트 처리
 */

import { useCallback } from "react";
import { useSSE } from "./useSSE";
import { useSSEHandlers } from "@/lib/stores";
import { getSSEStreamUrl } from "@/lib/api/agents";
import type { SSEEvent, SSEEventType } from "@/types/sse";

interface UseAgentSSEOptions {
  threadId: string | null;
  enabled?: boolean;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

interface UseAgentSSEReturn {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectCount: number;
  disconnect: () => void;
}

export function useAgentSSE({
  threadId,
  enabled = true,
  onComplete,
  onError,
}: UseAgentSSEOptions): UseAgentSSEReturn {
  const handlers = useSSEHandlers();

  // Handle incoming SSE message
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as SSEEvent & {
          // Backend alternative format
          phase?: string;
          step?: string;
          result?: {
            summary?: Record<string, unknown>;
            report?: string;
          };
        };

        // Determine event type - support both standard and backend formats
        let eventType = data.event as SSEEventType;

        // Backend format: phase/step based events
        if (!eventType && data.phase === "COMPLETED" && data.step === "report") {
          // Handle completion with report
          const summary = data.result?.report || "작업이 완료되었습니다.";
          const details = data.result?.summary;
          handlers.addResultMessage({
            thread_id: threadId || data.thread_id || "",
            summary,
            details,
            total_time_ms: 0,
          });
          onComplete?.();
          return;
        }

        switch (eventType) {
          case "connected":
            console.log("[SSE] Connected to stream");
            break;

          case "thought":
            if ("data" in data && data.data) {
              handlers.addThoughtMessage(data.data as {
                agent: import("@/types/agent").AgentCode;
                thought: string;
                next_agent?: import("@/types/agent").AgentCode;
              });
            }
            break;

          case "reasoning":
            // Reasoning events show AI thinking process - log for debugging
            if ("data" in data && data.data) {
              console.log("[SSE] Reasoning:", data.data);
            }
            break;

          case "agent_started":
            if ("data" in data && data.data) {
              const startData = data.data as {
                agent: import("@/types/agent").AgentCode;
                task: string;
              };
              handlers.addAgentStatusMessage({
                agent: startData.agent,
                status: "started",
                task: startData.task,
              });
            }
            break;

          case "agent_progress":
            if ("data" in data && data.data) {
              handlers.addProgressMessage(data.data as {
                agent: import("@/types/agent").AgentCode;
                step: string;
                progress: number;
                message: string;
              });
            }
            break;

          case "agent_completed":
            if ("data" in data && data.data) {
              const completeData = data.data as {
                agent: import("@/types/agent").AgentCode;
                result: Record<string, unknown>;
                confidence: number;
                duration_ms: number;
              };
              handlers.addAgentStatusMessage({
                agent: completeData.agent,
                status: "completed",
                result: completeData.result,
                confidence: completeData.confidence,
                duration_ms: completeData.duration_ms,
              });
            }
            break;

          case "agent_failed":
            if ("data" in data && data.data) {
              const failData = data.data as {
                agent: import("@/types/agent").AgentCode;
                error: string;
                recoverable: boolean;
              };
              handlers.addAgentStatusMessage({
                agent: failData.agent,
                status: "failed",
              });
              if (!failData.recoverable) {
                handlers.addErrorMessage({
                  code: "AGENT_FAILED",
                  message: failData.error,
                  recoverable: failData.recoverable,
                });
              }
            }
            break;

          case "subagent_started":
            // Subagent started - log for debugging
            if ("data" in data && data.data) {
              console.log("[SSE] Subagent started:", data.data);
            }
            break;

          case "subagent_completed":
            // Subagent completed - log for debugging
            if ("data" in data && data.data) {
              console.log("[SSE] Subagent completed:", data.data);
            }
            break;

          case "step_started":
            // Step started - log for debugging
            if ("data" in data && data.data) {
              console.log("[SSE] Step started:", data.data);
            }
            break;

          case "step_completed":
            // Check if this is a report completion event
            if ("data" in data && data.data) {
              const stepData = data.data as {
                step?: string;
                phase?: string;
                result?: {
                  summary?: Record<string, unknown>;
                  report?: string;
                };
              };

              // Handle final report completion
              if (stepData.step === "report" && stepData.phase === "COMPLETED") {
                const summary = stepData.result?.report || "작업이 완료되었습니다.";
                const details = stepData.result?.summary;
                handlers.addResultMessage({
                  thread_id: threadId || data.thread_id || "",
                  summary,
                  details,
                  total_time_ms: 0,
                });
                onComplete?.();
              } else {
                console.log("[SSE] Step completed:", data.data);
              }
            }
            break;

          case "approval_required":
            if ("data" in data && data.data) {
              handlers.addApprovalMessage(data.data as import("@/types/agent").ApprovalRequest);
            }
            break;

          case "complete":
            if ("data" in data && data.data) {
              const resultData = data.data as {
                summary?: string;
                details?: Record<string, unknown>;
                total_time_ms?: number;
                // Backend format
                result?: {
                  summary?: Record<string, unknown>;
                  report?: string;
                };
              };

              // Handle both frontend expected format and actual backend format
              const summary = resultData.summary ||
                resultData.result?.report ||
                "작업이 완료되었습니다.";
              const details = resultData.details || resultData.result?.summary;
              const totalTimeMs = resultData.total_time_ms || 0;

              handlers.addResultMessage({
                thread_id: threadId || "",
                summary,
                details,
                total_time_ms: totalTimeMs,
              });
              onComplete?.();
            }
            break;

          case "error":
            if ("data" in data && data.data) {
              const errorData = data.data as {
                code: string;
                message: string;
                recoverable: boolean;
              };
              handlers.addErrorMessage(errorData);
              onError?.(errorData.message);
            }
            break;

          case "heartbeat":
            // Just keep connection alive
            break;

          default:
            console.warn("[SSE] Unknown event type:", eventType);
        }
      } catch (error) {
        console.error("[SSE] Failed to parse event:", error);
      }
    },
    [handlers, threadId, onComplete, onError]
  );

  // Handle SSE error
  const handleError = useCallback(
    (error: Event) => {
      console.error("[SSE] Connection error:", error);
      onError?.("SSE 연결이 끊어졌습니다.");
    },
    [onError]
  );

  // Get SSE URL
  const sseUrl = threadId ? getSSEStreamUrl(threadId) : "";

  // Use base SSE hook
  const { isConnected, isConnecting, reconnectCount, disconnect } = useSSE({
    url: sseUrl,
    enabled: enabled && !!threadId,
    onMessage: handleMessage,
    onError: handleError,
    maxRetries: 5,
    retryDelay: 1000,
  });

  return {
    isConnected,
    isConnecting,
    reconnectCount,
    disconnect,
  };
}

export default useAgentSSE;
