/**
 * useSSE Hook
 *
 * 기본 Server-Sent Events 연결 관리
 */

import { useEffect, useRef, useCallback, useState } from "react";
import type { SSEConnectionState } from "@/types/sse";

interface UseSSEOptions {
  url: string;
  enabled?: boolean;
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

interface UseSSEReturn extends SSEConnectionState {
  connect: () => void;
  disconnect: () => void;
}

export function useSSE({
  url,
  enabled = true,
  onMessage,
  onError,
  onOpen,
  onClose,
  maxRetries = 5,
  retryDelay = 1000,
}: UseSSEOptions): UseSSEReturn {
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<SSEConnectionState>({
    isConnected: false,
    isConnecting: false,
    reconnectCount: 0,
    lastEventTime: null,
    error: null,
  });

  // Connect to SSE
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setState((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        retryCountRef.current = 0;
        setState({
          isConnected: true,
          isConnecting: false,
          reconnectCount: 0,
          lastEventTime: new Date().toISOString(),
          error: null,
        });
        onOpen?.();
      };

      eventSource.onmessage = (event) => {
        setState((prev) => ({
          ...prev,
          lastEventTime: new Date().toISOString(),
        }));
        onMessage?.(event);
      };

      eventSource.onerror = (error) => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: "Connection error",
        }));

        eventSource.close();
        eventSourceRef.current = null;
        onError?.(error);

        // Retry logic
        if (retryCountRef.current < maxRetries) {
          const delay = retryDelay * Math.pow(2, retryCountRef.current);
          retryCountRef.current++;

          setState((prev) => ({
            ...prev,
            reconnectCount: retryCountRef.current,
          }));

          retryTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, [url, onMessage, onError, onOpen, maxRetries, retryDelay]);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setState({
      isConnected: false,
      isConnecting: false,
      reconnectCount: 0,
      lastEventTime: null,
      error: null,
    });

    onClose?.();
  }, [onClose]);

  // Auto connect/disconnect based on enabled flag
  useEffect(() => {
    if (enabled && url) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, url, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
  };
}

export default useSSE;
