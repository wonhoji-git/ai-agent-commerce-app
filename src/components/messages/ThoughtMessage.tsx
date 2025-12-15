/**
 * Thought Message
 *
 * 슈퍼바이저 사고 과정 표시
 */

import { Brain, ArrowRight } from "lucide-react";
import { AgentBadge } from "@/components/ui/agent-badge";
import { formatRelativeTime } from "@/lib/utils";
import type { ThoughtMessage as ThoughtMessageType } from "@/types/chat";

export interface ThoughtMessageProps {
  message: ThoughtMessageType;
}

export function ThoughtMessage({ message }: ThoughtMessageProps) {
  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Brain className="w-4 h-4 text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          <AgentBadge agent={message.agent} size="sm" />
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(message.timestamp)}
          </span>
        </div>

        {/* Thought content */}
        <div className="bg-muted/50 rounded-xl p-3 text-sm border">
          <p className="text-foreground/80 italic">&ldquo;{message.thought}&rdquo;</p>
        </div>

        {/* Next agent indicator */}
        {message.next_agent && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowRight className="w-3 h-3" />
            <span>다음 에이전트:</span>
            <AgentBadge agent={message.next_agent} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ThoughtMessage;
