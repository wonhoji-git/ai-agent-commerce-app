/**
 * Message Item
 *
 * 개별 메시지 렌더러 - 타입별 분기
 */

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

// Message components (will be implemented in Phase 6)
import { UserMessage } from "@/components/messages/UserMessage";
import { ThoughtMessage } from "@/components/messages/ThoughtMessage";
import { AgentStatusMessage } from "@/components/messages/AgentStatusMessage";
import { ProgressMessage } from "@/components/messages/ProgressMessage";
import { ApprovalMessage } from "@/components/messages/ApprovalMessage";
import { ResultMessage } from "@/components/messages/ResultMessage";
import { ErrorMessage } from "@/components/messages/ErrorMessage";
import { InfoMessage } from "@/components/messages/InfoMessage";

export interface MessageItemProps {
  message: ChatMessage;
  className?: string;
}

export function MessageItem({ message, className }: MessageItemProps) {
  return (
    <div
      className={cn(
        "flex",
        message.role === "user" ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "max-w-[85%]",
          message.role === "user" && "max-w-[70%]"
        )}
      >
        {renderMessage(message)}
      </div>
    </div>
  );
}

function renderMessage(message: ChatMessage) {
  switch (message.type) {
    case "user_input":
      return <UserMessage message={message} />;

    case "thought":
      return <ThoughtMessage message={message} />;

    case "agent_status":
      return <AgentStatusMessage message={message} />;

    case "progress":
      return <ProgressMessage message={message} />;

    case "approval":
      return <ApprovalMessage message={message} />;

    case "result":
      return <ResultMessage message={message} />;

    case "error":
      return <ErrorMessage message={message} />;

    case "info":
      return <InfoMessage message={message} />;

    default:
      return (
        <div className="text-muted-foreground text-sm p-2 bg-muted rounded-lg">
          알 수 없는 메시지 타입
        </div>
      );
  }
}

export default MessageItem;
