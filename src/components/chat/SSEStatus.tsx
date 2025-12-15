/**
 * SSE Status
 *
 * SSE 연결 상태 표시
 */

import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SSEStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectCount: number;
}

export function SSEStatus({
  isConnected,
  isConnecting,
  reconnectCount,
}: SSEStatusProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {isConnecting ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-primary" />
          <span className="text-muted-foreground">
            연결 중...
            {reconnectCount > 0 && ` (재시도 ${reconnectCount}회)`}
          </span>
        </>
      ) : isConnected ? (
        <>
          <div className="relative">
            <Wifi className="w-3 h-3 text-success" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          </div>
          <span className="text-success">실시간 연결됨</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">연결 끊김</span>
        </>
      )}
    </div>
  );
}

export default SSEStatus;
