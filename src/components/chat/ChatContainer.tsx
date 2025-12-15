"use client";

/**
 * Chat Container
 *
 * 메인 채팅 인터페이스 컨테이너
 */

import { useEffect } from "react";
import { useChatStore, useSessionStatus, useThreadId } from "@/lib/stores";
import { useAgentSSE } from "@/lib/hooks";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { SSEStatus } from "./SSEStatus";

export function ChatContainer() {
  const initSession = useChatStore((state) => state.initSession);
  const resetSession = useChatStore((state) => state.resetSession);
  const status = useSessionStatus();
  const threadId = useThreadId();

  // Initialize session on mount
  useEffect(() => {
    initSession();
  }, [initSession]);

  // Connect to SSE when thread is active
  const { isConnected, isConnecting, reconnectCount } = useAgentSSE({
    threadId,
    enabled: !!threadId && status === "executing",
  });

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-background">
      {/* Header */}
      <ChatHeader status={status} onReset={resetSession} />

      {/* SSE Status (when executing) */}
      {status === "executing" && (
        <div className="px-4 py-2 border-b bg-accent/30">
          <SSEStatus
            isConnected={isConnected}
            isConnecting={isConnecting}
            reconnectCount={reconnectCount}
          />
        </div>
      )}

      {/* Messages */}
      <MessageList />

      {/* Input */}
      <ChatInput
        disabled={status === "executing" || status === "waiting_approval"}
      />
    </div>
  );
}

export default ChatContainer;
