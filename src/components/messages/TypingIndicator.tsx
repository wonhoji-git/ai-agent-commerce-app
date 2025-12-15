/**
 * Typing Indicator
 *
 * 에이전트 타이핑 인디케이터
 */

import { AgentBadge } from "@/components/ui/agent-badge";
import type { AgentCode } from "@/types/agent";

export interface TypingIndicatorProps {
  agent?: AgentCode;
}

export function TypingIndicator({ agent = "SUPERVISOR" }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3">
      {/* Dots animation */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Label */}
      <div className="flex items-center gap-2">
        <AgentBadge agent={agent} size="sm" />
        <span className="text-sm text-muted-foreground">생각 중...</span>
      </div>
    </div>
  );
}

export default TypingIndicator;
