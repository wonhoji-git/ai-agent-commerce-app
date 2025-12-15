/**
 * Chat Store
 *
 * Zustand 기반 채팅 상태 관리
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { executeAgent } from "@/lib/api/agents";
import * as approvalApi from "@/lib/api/approvals";
import type {
  ChatSession,
  ChatMessage,
  ChatSessionStatus,
  UserInputMessage,
  ThoughtMessage,
  AgentStatusMessage,
  ProgressMessage,
  ApprovalMessage,
  ResultMessage,
  ErrorMessage,
  InfoMessage,
} from "@/types/chat";
import type { AgentCode, ApprovalRequest } from "@/types/agent";

// Store state type
interface ChatState {
  // Session state
  session: ChatSession;
  threadId: string | null;

  // Session actions
  initSession: () => void;
  resetSession: () => void;
  setThreadId: (threadId: string | null) => void;
  setSessionStatus: (status: ChatSessionStatus) => void;

  // Message actions
  addMessage: (message: ChatMessage) => void;
  sendMessage: (content: string, images?: string[]) => Promise<void>;

  // SSE event handlers
  addThoughtMessage: (data: {
    agent: AgentCode;
    thought: string;
    next_agent?: AgentCode;
  }) => void;
  addAgentStatusMessage: (data: {
    agent: AgentCode;
    status: "started" | "completed" | "failed";
    task?: string;
    result?: Record<string, unknown>;
    confidence?: number;
    duration_ms?: number;
  }) => void;
  addProgressMessage: (data: {
    agent: AgentCode;
    step: string;
    progress: number;
    message: string;
  }) => void;
  addApprovalMessage: (approval: ApprovalRequest) => void;
  addResultMessage: (data: {
    thread_id: string;
    summary: string;
    details?: Record<string, unknown>;
    total_time_ms: number;
  }) => void;
  addErrorMessage: (data: {
    code: string;
    message: string;
    recoverable: boolean;
  }) => void;
  addInfoMessage: (content: string) => void;

  // Approval actions
  respondToApproval: (
    approvalId: string,
    decision: "APPROVED" | "REJECTED" | "MODIFIED",
    modifications?: Record<string, unknown>
  ) => Promise<void>;
  updateApprovalMessage: (
    approvalId: string,
    decision: string,
    modifications?: Record<string, unknown>
  ) => void;
}

// Helper functions
const generateMessageId = () =>
  `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const getCurrentTimestamp = () => new Date().toISOString();

// Initial session state
const initialSession: ChatSession = {
  id: "",
  thread_id: null,
  seller_no: parseInt(process.env.NEXT_PUBLIC_TEST_SELLER_NO || "1", 10),
  status: "idle",
  messages: [],
  created_at: "",
  updated_at: "",
};

// Create store
export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        session: { ...initialSession },
        threadId: null,

        // Initialize session
        initSession: () => {
          set((state) => {
            state.session = {
              ...initialSession,
              id: `session_${Date.now()}`,
              created_at: getCurrentTimestamp(),
              updated_at: getCurrentTimestamp(),
            };
          });
        },

        // Reset session
        resetSession: () => {
          set((state) => {
            state.session = {
              ...initialSession,
              id: `session_${Date.now()}`,
              created_at: getCurrentTimestamp(),
              updated_at: getCurrentTimestamp(),
            };
            state.threadId = null;
          });
        },

        // Set thread ID
        setThreadId: (threadId) => {
          set((state) => {
            state.threadId = threadId;
            state.session.thread_id = threadId;
          });
        },

        // Set session status
        setSessionStatus: (status) => {
          set((state) => {
            state.session.status = status;
            state.session.updated_at = getCurrentTimestamp();
          });
        },

        // Add message
        addMessage: (message) => {
          set((state) => {
            state.session.messages.push(message);
            state.session.updated_at = getCurrentTimestamp();
          });
        },

        // Send message (user input)
        sendMessage: async (content, images) => {
          const { setThreadId, setSessionStatus, addMessage } = get();

          // Add user message
          const userMessage: UserInputMessage = {
            id: generateMessageId(),
            role: "user",
            type: "user_input",
            content,
            timestamp: getCurrentTimestamp(),
            attachments: images?.map((url, i) => ({
              id: `attach_${i}`,
              type: "image" as const,
              name: `image_${i}.jpg`,
              url,
            })),
          };
          addMessage(userMessage);

          // Set status to executing
          setSessionStatus("executing");

          try {
            // Execute agent
            const response = await executeAgent({
              request: content,
              context: images ? { images } : undefined,
            });

            // Set thread ID for SSE connection
            setThreadId(response.thread_id);

            // Add info message
            const infoMessage: InfoMessage = {
              id: generateMessageId(),
              role: "system",
              type: "info",
              content: "AI 에이전트가 요청을 처리하고 있습니다...",
              timestamp: getCurrentTimestamp(),
            };
            addMessage(infoMessage);
          } catch (error) {
            console.error("Failed to execute agent:", error);
            setSessionStatus("error");

            const errorMessage: ErrorMessage = {
              id: generateMessageId(),
              role: "system",
              type: "error",
              code: "EXECUTION_ERROR",
              message: "에이전트 실행에 실패했습니다.",
              recoverable: true,
              timestamp: getCurrentTimestamp(),
            };
            addMessage(errorMessage);
          }
        },

        // Add thought message (from SSE)
        addThoughtMessage: (data) => {
          const message: ThoughtMessage = {
            id: generateMessageId(),
            role: "assistant",
            type: "thought",
            agent: data.agent,
            thought: data.thought,
            next_agent: data.next_agent,
            timestamp: getCurrentTimestamp(),
          };
          get().addMessage(message);
        },

        // Add agent status message (from SSE)
        addAgentStatusMessage: (data) => {
          const message: AgentStatusMessage = {
            id: generateMessageId(),
            role: "assistant",
            type: "agent_status",
            agent: data.agent,
            status: data.status,
            task: data.task,
            result: data.result,
            confidence: data.confidence,
            duration_ms: data.duration_ms,
            timestamp: getCurrentTimestamp(),
          };
          get().addMessage(message);
        },

        // Add progress message (from SSE)
        addProgressMessage: (data) => {
          set((state) => {
            // Find existing progress message for same agent+step
            const existingIndex = state.session.messages.findIndex(
              (m) =>
                m.type === "progress" &&
                (m as ProgressMessage).agent === data.agent &&
                (m as ProgressMessage).step === data.step
            );

            const progressMessage: ProgressMessage = {
              id:
                existingIndex >= 0
                  ? state.session.messages[existingIndex].id
                  : generateMessageId(),
              role: "assistant",
              type: "progress",
              agent: data.agent,
              step: data.step,
              progress: data.progress,
              message: data.message,
              timestamp: getCurrentTimestamp(),
            };

            if (existingIndex >= 0) {
              state.session.messages[existingIndex] = progressMessage;
            } else {
              state.session.messages.push(progressMessage);
            }
            state.session.updated_at = getCurrentTimestamp();
          });
        },

        // Add approval message (from SSE)
        addApprovalMessage: (approval) => {
          const message: ApprovalMessage = {
            id: generateMessageId(),
            role: "assistant",
            type: "approval",
            approval,
            responded: false,
            timestamp: getCurrentTimestamp(),
          };
          get().addMessage(message);
          get().setSessionStatus("waiting_approval");
        },

        // Add result message (from SSE)
        addResultMessage: (data) => {
          const message: ResultMessage = {
            id: generateMessageId(),
            role: "assistant",
            type: "result",
            thread_id: data.thread_id,
            summary: data.summary,
            details: data.details,
            total_time_ms: data.total_time_ms,
            timestamp: getCurrentTimestamp(),
          };
          get().addMessage(message);
          get().setSessionStatus("completed");
        },

        // Add error message
        addErrorMessage: (data) => {
          const message: ErrorMessage = {
            id: generateMessageId(),
            role: "system",
            type: "error",
            code: data.code,
            message: data.message,
            recoverable: data.recoverable,
            timestamp: getCurrentTimestamp(),
          };
          get().addMessage(message);
          get().setSessionStatus("error");
        },

        // Add info message
        addInfoMessage: (content) => {
          const message: InfoMessage = {
            id: generateMessageId(),
            role: "system",
            type: "info",
            content,
            timestamp: getCurrentTimestamp(),
          };
          get().addMessage(message);
        },

        // Respond to approval
        respondToApproval: async (approvalId, decision, modifications) => {
          const { updateApprovalMessage, addInfoMessage, setSessionStatus } =
            get();

          try {
            if (decision === "APPROVED") {
              await approvalApi.approve(approvalId, modifications);
              updateApprovalMessage(approvalId, "APPROVED");
              addInfoMessage("승인이 완료되었습니다.");
              setSessionStatus("executing");
            } else if (decision === "REJECTED") {
              await approvalApi.reject(approvalId);
              updateApprovalMessage(approvalId, "REJECTED");
              addInfoMessage("승인이 거절되었습니다.");
              setSessionStatus("idle");
            } else if (decision === "MODIFIED" && modifications) {
              await approvalApi.modifyAndApprove(approvalId, modifications);
              updateApprovalMessage(approvalId, "MODIFIED", modifications);
              addInfoMessage("수정 사항이 반영되어 승인되었습니다.");
              setSessionStatus("executing");
            }
          } catch (error) {
            console.error("Failed to respond to approval:", error);
            addInfoMessage("승인 처리 중 오류가 발생했습니다.");
          }
        },

        // Update approval message
        updateApprovalMessage: (approvalId, decision, modifications) => {
          set((state) => {
            const messageIndex = state.session.messages.findIndex(
              (m) =>
                m.type === "approval" &&
                (m as ApprovalMessage).approval.approval_id === approvalId
            );

            if (messageIndex >= 0) {
              const message = state.session.messages[
                messageIndex
              ] as ApprovalMessage;
              message.responded = true;
              message.response = { decision, modifications };
              state.session.updated_at = getCurrentTimestamp();
            }
          });
        },
      })),
      {
        name: "ai-agent-chat-storage",
        partialize: (state) => ({
          session: {
            id: state.session.id,
            messages: state.session.messages.slice(-50),
          },
        }),
        onRehydrateStorage: () => (state) => {
          // Ensure session has all required fields after rehydration
          if (state) {
            state.session = {
              ...initialSession,
              ...state.session,
              status: "idle",
            };
          }
        },
      }
    ),
    { name: "ChatStore" }
  )
);

export default useChatStore;
