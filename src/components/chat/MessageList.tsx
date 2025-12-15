"use client";

/**
 * Message List
 *
 * 스크롤 가능한 메시지 목록
 */

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "./MessageItem";
import { useChatStore, useMessages } from "@/lib/stores";
import { Sparkles } from "lucide-react";

export function MessageList() {
  const messages = useMessages();
  const sendMessage = useChatStore((state) => state.sendMessage);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={sendMessage} />
        ) : (
          messages.map((message, index) => (
            <MessageItem
              key={message.id}
              message={message}
              className={`message-enter stagger-${Math.min(index % 5 + 1, 5)}`}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
}

function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestions = [
    "이 상품 올려줘",
    "오늘 문의 정리해줘",
    "배송 지연 건 확인해줘",
    "할인 캠페인 만들어줘",
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-12">
      {/* Logo */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 shadow-sm border">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold mb-2 tracking-tight">
        무엇을 도와드릴까요?
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        상품 등록, 가격 책정, 고객 문의 응대 등
        <br />
        AI 에이전트가 쇼핑몰 운영을 도와드립니다.
      </p>

      {/* Suggestions */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-md">
        {suggestions.map((text) => (
          <button
            key={text}
            onClick={() => onSuggestionClick(text)}
            className="px-4 py-3 text-left text-sm rounded-xl border bg-card hover:bg-accent hover:border-primary/20 transition-all duration-200 hover:shadow-sm card-hover"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MessageList;
