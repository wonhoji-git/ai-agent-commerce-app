/**
 * Progress Message
 *
 * 에이전트 작업 진행률 표시
 */

import { Loader2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AgentBadge } from "@/components/ui/agent-badge";
import { cn } from "@/lib/utils";
import type { ProgressMessage as ProgressMessageType } from "@/types/chat";

export interface ProgressMessageProps {
  message: ProgressMessageType;
}

export function ProgressMessage({ message }: ProgressMessageProps) {
  const isComplete = message.progress >= 100;

  return (
    <div className="flex gap-3">
      {/* Spinner/Check */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        {isComplete ? (
          <CheckCircle2 className="w-4 h-4 text-success" />
        ) : (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          <AgentBadge agent={message.agent} size="sm" />
          <span className="text-sm text-muted-foreground">{message.step}</span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <Progress value={message.progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{message.message}</span>
            <span
              className={cn(
                "font-medium",
                isComplete ? "text-success" : "text-primary"
              )}
            >
              {message.progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressMessage;
