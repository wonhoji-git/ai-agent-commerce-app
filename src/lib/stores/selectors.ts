/**
 * Store Selectors
 *
 * 메모이즈된 셀렉터로 효율적인 리렌더링
 */

import { useShallow } from "zustand/react/shallow";
import { useChatStore } from "./chatStore";
import type { ChatMessage, ApprovalMessage } from "@/types/chat";

/** 세션 상태 */
export const useSessionStatus = () =>
  useChatStore((state) => state.session.status);

/** 스레드 ID */
export const useThreadId = () => useChatStore((state) => state.threadId);

/** 전체 메시지 */
export const useMessages = () =>
  useChatStore((state) => state.session.messages);

/** 마지막 메시지 */
export const useLastMessage = (): ChatMessage | undefined =>
  useChatStore(
    (state) => state.session.messages[state.session.messages.length - 1]
  );

/** 대기 중인 승인 */
export const usePendingApprovals = () =>
  useChatStore(
    useShallow((state) =>
      state.session.messages.filter(
        (m): m is ApprovalMessage =>
          m.type === "approval" && !(m as ApprovalMessage).responded
      )
    )
  );

/** 실행 중 여부 */
export const useIsExecuting = () =>
  useChatStore((state) => state.session.status === "executing");

/** 승인 대기 중 여부 */
export const useIsWaitingApproval = () =>
  useChatStore((state) => state.session.status === "waiting_approval");

/** 입력 비활성화 여부 */
export const useIsInputDisabled = () =>
  useChatStore(
    (state) =>
      state.session.status === "executing" ||
      state.session.status === "waiting_approval"
  );

/** 채팅 액션들 */
export const useChatActions = () =>
  useChatStore(
    useShallow((state) => ({
      initSession: state.initSession,
      sendMessage: state.sendMessage,
      resetSession: state.resetSession,
      respondToApproval: state.respondToApproval,
    }))
  );

/** SSE 이벤트 핸들러들 */
export const useSSEHandlers = () =>
  useChatStore(
    useShallow((state) => ({
      addThoughtMessage: state.addThoughtMessage,
      addAgentStatusMessage: state.addAgentStatusMessage,
      addProgressMessage: state.addProgressMessage,
      addApprovalMessage: state.addApprovalMessage,
      addResultMessage: state.addResultMessage,
      addErrorMessage: state.addErrorMessage,
      setSessionStatus: state.setSessionStatus,
    }))
  );
