/**
 * Error Message
 *
 * 오류 메시지 표시
 */

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ErrorMessage as ErrorMessageType } from "@/types/chat";

export interface ErrorMessageProps {
  message: ErrorMessageType;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="rounded-xl border border-error/30 bg-error/5 p-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-error">오류 발생</span>
            <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {message.code}
            </code>
          </div>
          <p className="text-sm text-foreground/80">{message.message}</p>

          {message.recoverable && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              다시 시도
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorMessage;
