# 03. SSE Streaming Implementation

## Overview

Server-Sent Events (SSE)를 통해 에이전트 실행 상태를 실시간으로 수신합니다.
연결 관리, 이벤트 파싱, 재연결 로직을 구현합니다.

---

## Step 1: SSE Connection Hook

### `src/lib/hooks/useSSE.ts`

```typescript
/**
 * SSE (Server-Sent Events) Connection Hook
 *
 * Manages SSE connection lifecycle, event parsing, and reconnection
 */

import { useEffect, useRef, useCallback, useState } from "react";
import type { SSEEvent, SSEEventType, ParsedSSEMessage } from "@/types/sse";

// SSE Hook Options
export interface UseSSEOptions {
  url: string;
  enabled?: boolean;
  onMessage?: (event: SSEEvent) => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxRetries?: number;
}

// SSE Hook Return Type
export interface UseSSEReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  reconnectCount: number;
  connect: () => void;
  disconnect: () => void;
}

// Default options
const DEFAULT_OPTIONS = {
  enabled: true,
  reconnect: true,
  reconnectInterval: 3000,
  maxRetries: 5,
};

/**
 * Parse SSE message string into structured event
 */
function parseSSEMessage(rawMessage: string): ParsedSSEMessage | null {
  const lines = rawMessage.split("\n");
  const result: Partial<ParsedSSEMessage> = {};

  for (const line of lines) {
    if (line.startsWith("id:")) {
      result.id = line.slice(3).trim();
    } else if (line.startsWith("event:")) {
      result.event = line.slice(6).trim() as SSEEventType;
    } else if (line.startsWith("data:")) {
      try {
        result.data = JSON.parse(line.slice(5).trim());
      } catch {
        result.data = { raw: line.slice(5).trim() };
      }
    } else if (line.startsWith("retry:")) {
      result.retry = parseInt(line.slice(6).trim(), 10);
    }
  }

  if (result.event && result.data) {
    return {
      id: result.id || crypto.randomUUID(),
      event: result.event,
      data: result.data,
      retry: result.retry,
    };
  }

  return null;
}

/**
 * Convert parsed message to typed SSE event
 */
function toTypedEvent(message: ParsedSSEMessage): SSEEvent {
  const baseEvent = {
    event_type: message.event,
    event_id: message.id,
    timestamp: new Date().toISOString(),
  };

  return {
    ...baseEvent,
    data: message.data,
  } as SSEEvent;
}

/**
 * useSSE Hook
 */
export function useSSE(options: UseSSEOptions): UseSSEReturn {
  const {
    url,
    enabled = DEFAULT_OPTIONS.enabled,
    onMessage,
    onError,
    onOpen,
    onClose,
    reconnect = DEFAULT_OPTIONS.reconnect,
    reconnectInterval = DEFAULT_OPTIONS.reconnectInterval,
    maxRetries = DEFAULT_OPTIONS.maxRetries,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastEventIdRef = useRef<string | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // Connect function
  const connect = useCallback(() => {
    if (!enabled || !url) return;

    cleanup();
    setIsConnecting(true);
    setError(null);

    // Append lastEventId if reconnecting
    let connectUrl = url;
    if (lastEventIdRef.current) {
      const separator = url.includes("?") ? "&" : "?";
      connectUrl = `${url}${separator}lastEventId=${lastEventIdRef.current}`;
    }

    const eventSource = new EventSource(connectUrl);
    eventSourceRef.current = eventSource;

    // Handle connection open
    eventSource.onopen = () => {
      console.log("[SSE] Connection opened:", url);
      setIsConnected(true);
      setIsConnecting(false);
      setReconnectCount(0);
      onOpen?.();
    };

    // Handle messages
    eventSource.onmessage = (event) => {
      const message = parseSSEMessage(`data:${event.data}`);
      if (message) {
        lastEventIdRef.current = message.id;
        const typedEvent = toTypedEvent(message);
        onMessage?.(typedEvent);
      }
    };

    // Handle specific event types
    const eventTypes: SSEEventType[] = [
      "thought",
      "agent_start",
      "progress",
      "agent_complete",
      "approval_required",
      "complete",
      "error",
      "heartbeat",
    ];

    eventTypes.forEach((eventType) => {
      eventSource.addEventListener(eventType, (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          const typedEvent: SSEEvent = {
            event_type: eventType,
            event_id: event.lastEventId || crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            data,
          } as SSEEvent;

          lastEventIdRef.current = typedEvent.event_id;
          onMessage?.(typedEvent);
        } catch (parseError) {
          console.error("[SSE] Failed to parse event data:", parseError);
        }
      });
    });

    // Handle errors
    eventSource.onerror = (event) => {
      console.error("[SSE] Connection error:", event);

      const connectionError = new Error("SSE connection error");
      setError(connectionError);
      setIsConnected(false);
      setIsConnecting(false);
      onError?.(connectionError);

      // Close current connection
      eventSource.close();
      eventSourceRef.current = null;

      // Attempt reconnection
      if (reconnect && reconnectCount < maxRetries) {
        console.log(
          `[SSE] Reconnecting in ${reconnectInterval}ms... (attempt ${reconnectCount + 1}/${maxRetries})`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectCount((prev) => prev + 1);
          connect();
        }, reconnectInterval);
      } else if (reconnectCount >= maxRetries) {
        console.error("[SSE] Max reconnection attempts reached");
        onClose?.();
      }
    };
  }, [
    url,
    enabled,
    reconnect,
    reconnectInterval,
    maxRetries,
    reconnectCount,
    onMessage,
    onError,
    onOpen,
    onClose,
    cleanup,
  ]);

  // Disconnect function
  const disconnect = useCallback(() => {
    console.log("[SSE] Disconnecting...");
    cleanup();
    setIsConnected(false);
    setIsConnecting(false);
    setReconnectCount(0);
    lastEventIdRef.current = null;
    onClose?.();
  }, [cleanup, onClose]);

  // Effect: Connect/disconnect based on enabled state
  useEffect(() => {
    if (enabled && url) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      cleanup();
    };
  }, [enabled, url]); // Only depend on enabled and url

  return {
    isConnected,
    isConnecting,
    error,
    reconnectCount,
    connect,
    disconnect,
  };
}

export default useSSE;
```

---

## Step 2: Agent-Specific SSE Hook

### `src/lib/hooks/useAgentSSE.ts`

```typescript
/**
 * Agent-specific SSE Hook
 *
 * Manages SSE connection for agent execution
 */

import { useCallback } from "react";
import { useSSE, type UseSSEReturn } from "./useSSE";
import { getAgentStreamUrl } from "@/lib/api/agents";
import type { SSEEvent } from "@/types/sse";
import { useChatStore } from "@/lib/stores/chatStore";

export interface UseAgentSSEOptions {
  threadId: string | null;
  enabled?: boolean;
}

export interface UseAgentSSEReturn extends UseSSEReturn {
  threadId: string | null;
}

/**
 * useAgentSSE Hook
 */
export function useAgentSSE({
  threadId,
  enabled = true,
}: UseAgentSSEOptions): UseAgentSSEReturn {
  const {
    addThoughtMessage,
    addAgentStatusMessage,
    addProgressMessage,
    addApprovalMessage,
    addResultMessage,
    addErrorMessage,
    setSessionStatus,
  } = useChatStore();

  // Handle incoming SSE events
  const handleMessage = useCallback(
    (event: SSEEvent) => {
      console.log("[AgentSSE] Received event:", event.event_type, event.data);

      switch (event.event_type) {
        case "thought":
          addThoughtMessage({
            agent: event.data.agent,
            thought: event.data.thought,
            next_agent: event.data.next_agent,
          });
          break;

        case "agent_start":
          addAgentStatusMessage({
            agent: event.data.agent,
            status: "started",
            task: event.data.task,
          });
          break;

        case "progress":
          addProgressMessage({
            agent: event.data.agent,
            step: event.data.step,
            progress: event.data.progress,
            message: event.data.message,
          });
          break;

        case "agent_complete":
          addAgentStatusMessage({
            agent: event.data.agent,
            status: "completed",
            result: event.data.result,
            confidence: event.data.confidence,
            duration_ms: event.data.duration_ms,
          });
          break;

        case "approval_required":
          addApprovalMessage(event.data);
          setSessionStatus("waiting_approval");
          break;

        case "complete":
          addResultMessage({
            thread_id: event.data.thread_id,
            summary: event.data.final_result.summary,
            details: event.data.final_result,
            total_time_ms: event.data.total_time_ms,
          });
          setSessionStatus("completed");
          break;

        case "error":
          addErrorMessage({
            code: event.data.code,
            message: event.data.message,
            recoverable: event.data.recoverable,
          });
          if (!event.data.recoverable) {
            setSessionStatus("error");
          }
          break;

        case "heartbeat":
          // Heartbeat received, connection is alive
          console.log("[AgentSSE] Heartbeat received");
          break;

        default:
          console.warn("[AgentSSE] Unknown event type:", event.event_type);
      }
    },
    [
      addThoughtMessage,
      addAgentStatusMessage,
      addProgressMessage,
      addApprovalMessage,
      addResultMessage,
      addErrorMessage,
      setSessionStatus,
    ]
  );

  // Handle SSE errors
  const handleError = useCallback(
    (error: Error) => {
      console.error("[AgentSSE] Error:", error);
      addErrorMessage({
        code: "SSE_ERROR",
        message: "실시간 연결에 문제가 발생했습니다.",
        recoverable: true,
      });
    },
    [addErrorMessage]
  );

  // Handle SSE connection open
  const handleOpen = useCallback(() => {
    console.log("[AgentSSE] Connection established for thread:", threadId);
  }, [threadId]);

  // Handle SSE connection close
  const handleClose = useCallback(() => {
    console.log("[AgentSSE] Connection closed for thread:", threadId);
  }, [threadId]);

  // Build stream URL
  const streamUrl = threadId ? getAgentStreamUrl(threadId) : "";

  // Use base SSE hook
  const sseReturn = useSSE({
    url: streamUrl,
    enabled: enabled && !!threadId,
    onMessage: handleMessage,
    onError: handleError,
    onOpen: handleOpen,
    onClose: handleClose,
    reconnect: true,
    reconnectInterval: 3000,
    maxRetries: 5,
  });

  return {
    ...sseReturn,
    threadId,
  };
}

export default useAgentSSE;
```

---

## Step 3: Seller Events SSE Hook

### `src/lib/hooks/useSellerSSE.ts`

```typescript
/**
 * Seller Events SSE Hook
 *
 * Subscribes to all seller notifications (approvals, alerts, etc.)
 */

import { useCallback } from "react";
import { useSSE, type UseSSEReturn } from "./useSSE";
import { getSellerStreamUrl } from "@/lib/api/agents";
import type { SSEEvent } from "@/types/sse";

export interface UseSellerSSEOptions {
  enabled?: boolean;
  onApprovalRequired?: (data: Record<string, unknown>) => void;
  onNotification?: (data: Record<string, unknown>) => void;
}

/**
 * useSellerSSE Hook
 */
export function useSellerSSE({
  enabled = true,
  onApprovalRequired,
  onNotification,
}: UseSellerSSEOptions = {}): UseSSEReturn {
  // Handle incoming SSE events
  const handleMessage = useCallback(
    (event: SSEEvent) => {
      console.log("[SellerSSE] Received event:", event.event_type);

      switch (event.event_type) {
        case "approval_required":
          onApprovalRequired?.(event.data);
          break;

        case "heartbeat":
          // Heartbeat - connection is alive
          break;

        default:
          // Other events as notifications
          onNotification?.(event.data);
      }
    },
    [onApprovalRequired, onNotification]
  );

  // Build stream URL
  const streamUrl = getSellerStreamUrl();

  // Use base SSE hook
  return useSSE({
    url: streamUrl,
    enabled,
    onMessage: handleMessage,
    reconnect: true,
    reconnectInterval: 5000,
    maxRetries: 10,
  });
}

export default useSellerSSE;
```

---

## Step 4: SSE Connection Status Component

### `src/components/chat/SSEStatus.tsx`

```tsx
/**
 * SSE Connection Status Indicator
 */

import { cn } from "@/lib/utils/cn";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export interface SSEStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectCount: number;
  className?: string;
}

export function SSEStatus({
  isConnected,
  isConnecting,
  reconnectCount,
  className,
}: SSEStatusProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs px-2 py-1 rounded-full",
        isConnected && "bg-green-100 text-green-700",
        isConnecting && "bg-yellow-100 text-yellow-700",
        !isConnected && !isConnecting && "bg-red-100 text-red-700",
        className
      )}
    >
      {isConnecting ? (
        <>
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>연결 중{reconnectCount > 0 && ` (${reconnectCount})`}...</span>
        </>
      ) : isConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          <span>실시간 연결됨</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>연결 끊김</span>
        </>
      )}
    </div>
  );
}

export default SSEStatus;
```

---

## Step 5: SSE Event Debug Panel (Development)

### `src/components/debug/SSEDebugPanel.tsx`

```tsx
/**
 * SSE Event Debug Panel
 *
 * Development tool to monitor SSE events
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { SSEEvent } from "@/types/sse";

interface SSEDebugEvent {
  id: string;
  timestamp: string;
  event: SSEEvent;
}

export interface SSEDebugPanelProps {
  events: SSEEvent[];
}

export function SSEDebugPanel({ events }: SSEDebugPanelProps) {
  const [debugEvents, setDebugEvents] = useState<SSEDebugEvent[]>([]);

  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[events.length - 1];
      setDebugEvents((prev) => [
        ...prev,
        {
          id: latestEvent.event_id || crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          event: latestEvent,
        },
      ].slice(-50)); // Keep last 50 events
    }
  }, [events]);

  const getEventColor = (eventType: string) => {
    const colors: Record<string, string> = {
      thought: "bg-purple-100 text-purple-800",
      agent_start: "bg-blue-100 text-blue-800",
      progress: "bg-yellow-100 text-yellow-800",
      agent_complete: "bg-green-100 text-green-800",
      approval_required: "bg-orange-100 text-orange-800",
      complete: "bg-emerald-100 text-emerald-800",
      error: "bg-red-100 text-red-800",
      heartbeat: "bg-gray-100 text-gray-800",
    };
    return colors[eventType] || "bg-gray-100 text-gray-800";
  };

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 z-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">SSE Events</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDebugEvents([])}
          >
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {debugEvents.map((item) => (
              <div
                key={item.id}
                className="text-xs border rounded p-2 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <Badge className={getEventColor(item.event.event_type)}>
                    {item.event.event_type}
                  </Badge>
                  <span className="text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <pre className="text-xs overflow-auto bg-muted p-1 rounded max-h-20">
                  {JSON.stringify(item.event.data, null, 2)}
                </pre>
              </div>
            ))}
            {debugEvents.length === 0 && (
              <p className="text-center text-muted-foreground">
                No events yet
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default SSEDebugPanel;
```

---

## Step 6: Hook Exports

### `src/lib/hooks/index.ts`

```typescript
/**
 * Hooks module exports
 */

export { useSSE, type UseSSEOptions, type UseSSEReturn } from "./useSSE";
export {
  useAgentSSE,
  type UseAgentSSEOptions,
  type UseAgentSSEReturn,
} from "./useAgentSSE";
export { useSellerSSE, type UseSellerSSEOptions } from "./useSellerSSE";
export {
  useAgents,
  useAgentStatus,
  useAgentHistory,
  useExecuteAgent,
  useApproveAgent,
  useCancelAgent,
  agentKeys,
} from "./useAgentQuery";
```

---

## Usage Example

```tsx
"use client";

import { useState } from "react";
import { useAgentSSE } from "@/lib/hooks";
import { SSEStatus } from "@/components/chat/SSEStatus";

export function AgentChat() {
  const [threadId, setThreadId] = useState<string | null>(null);

  // Connect to SSE when thread is active
  const { isConnected, isConnecting, reconnectCount } = useAgentSSE({
    threadId,
    enabled: !!threadId,
  });

  return (
    <div>
      <SSEStatus
        isConnected={isConnected}
        isConnecting={isConnecting}
        reconnectCount={reconnectCount}
      />
      {/* Rest of chat UI */}
    </div>
  );
}
```

---

## SSE Event Flow

```
Backend (FastAPI)                    Frontend (React)
      │                                    │
      │  POST /agents/execute              │
      │◀───────────────────────────────────│
      │                                    │
      │  { thread_id: "abc123" }           │
      │────────────────────────────────────▶
      │                                    │
      │  GET /sse/agent/abc123             │
      │◀───────────────────────────────────│
      │                                    │
      │  event: thought                    │
      │  data: {...}                       │
      │────────────────────────────────────▶
      │                                    │
      │  event: agent_start                │
      │  data: {...}                       │
      │────────────────────────────────────▶
      │                                    │
      │  event: progress (30%)             │
      │────────────────────────────────────▶
      │                                    │
      │  event: progress (60%)             │
      │────────────────────────────────────▶
      │                                    │
      │  event: approval_required          │
      │  data: {...}                       │
      │────────────────────────────────────▶
      │                                    │
      │  POST /approvals/xxx/approve       │
      │◀───────────────────────────────────│
      │                                    │
      │  event: agent_complete             │
      │────────────────────────────────────▶
      │                                    │
      │  event: complete                   │
      │  data: { summary: "..." }          │
      │────────────────────────────────────▶
```

---

## Next Step

다음 문서 [04_CHAT_UI_COMPONENTS.md](./04_CHAT_UI_COMPONENTS.md)에서 채팅 UI 컴포넌트를 구현합니다.
