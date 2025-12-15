/**
 * Agent Status Message
 *
 * 에이전트 시작/완료/실패 상태 표시
 */

import { Play, CheckCircle, XCircle, Clock } from "lucide-react";
import { AgentBadge } from "@/components/ui/agent-badge";
import { formatRelativeTime, formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AgentStatusMessage as AgentStatusMessageType } from "@/types/chat";

export interface AgentStatusMessageProps {
  message: AgentStatusMessageType;
}

export function AgentStatusMessage({ message }: AgentStatusMessageProps) {
  const isStarted = message.status === "started";
  const isCompleted = message.status === "completed";
  const isFailed = message.status === "failed";

  return (
    <div className="flex gap-3">
      {/* Status icon */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isStarted && "bg-primary/10",
          isCompleted && "bg-success/10",
          isFailed && "bg-error/10"
        )}
      >
        {isStarted && <Play className="w-4 h-4 text-primary" />}
        {isCompleted && <CheckCircle className="w-4 h-4 text-success" />}
        {isFailed && <XCircle className="w-4 h-4 text-error" />}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <AgentBadge agent={message.agent} size="sm" />
          <span
            className={cn(
              "text-sm font-medium",
              isStarted && "text-primary",
              isCompleted && "text-success",
              isFailed && "text-error"
            )}
          >
            {isStarted && "작업 시작"}
            {isCompleted && "작업 완료"}
            {isFailed && "작업 실패"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(message.timestamp)}
          </span>
        </div>

        {/* Task description (for started) */}
        {isStarted && message.task && (
          <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border">
            {message.task}
          </div>
        )}

        {/* Completion details */}
        {isCompleted && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {message.duration_ms && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(message.duration_ms)}
              </span>
            )}
            {message.confidence !== undefined && (
              <span className="px-2 py-0.5 bg-success/10 text-success rounded-full">
                신뢰도: {Math.round(message.confidence * 100)}%
              </span>
            )}
          </div>
        )}

        {/* Result preview */}
        {isCompleted && message.result && (
          <div className="bg-muted/30 rounded-lg p-3 text-xs border">
            <pre className="overflow-auto max-h-24 text-muted-foreground">
              {JSON.stringify(message.result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentStatusMessage;
