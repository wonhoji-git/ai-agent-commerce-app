# 04. Chat UI Components

## Overview

채팅 인터페이스의 핵심 컴포넌트들을 구현합니다.
Linear.app 스타일의 심플하고 깔끔한 디자인을 지향합니다.

---

## Step 1: Chat Container

### `src/components/chat/ChatContainer.tsx`

```tsx
/**
 * Chat Container
 *
 * Main chat interface container
 */

"use client";

import { useEffect } from "react";
import { useChatStore } from "@/lib/stores/chatStore";
import { useAgentSSE } from "@/lib/hooks/useAgentSSE";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { SSEStatus } from "./SSEStatus";

export function ChatContainer() {
  const {
    session,
    threadId,
    initSession,
    resetSession,
  } = useChatStore();

  // Initialize session on mount
  useEffect(() => {
    initSession();
  }, [initSession]);

  // Connect to SSE when thread is active
  const { isConnected, isConnecting, reconnectCount } = useAgentSSE({
    threadId,
    enabled: !!threadId && session.status === "executing",
  });

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-background">
      {/* Header */}
      <ChatHeader
        status={session.status}
        onReset={resetSession}
      />

      {/* SSE Status (when executing) */}
      {session.status === "executing" && (
        <div className="px-4 py-2 border-b">
          <SSEStatus
            isConnected={isConnected}
            isConnecting={isConnecting}
            reconnectCount={reconnectCount}
          />
        </div>
      )}

      {/* Messages */}
      <MessageList messages={session.messages} />

      {/* Input */}
      <ChatInput disabled={session.status === "executing"} />
    </div>
  );
}

export default ChatContainer;
```

---

## Step 2: Chat Header

### `src/components/chat/ChatHeader.tsx`

```tsx
/**
 * Chat Header
 *
 * Header with title and controls
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bot, MoreVertical, RefreshCw, History, Settings } from "lucide-react";
import type { ChatSession } from "@/types/chat";

export interface ChatHeaderProps {
  status: ChatSession["status"];
  onReset: () => void;
}

const STATUS_LABELS: Record<ChatSession["status"], string> = {
  idle: "대기 중",
  executing: "실행 중",
  waiting_approval: "승인 대기",
  completed: "완료",
  error: "오류",
};

const STATUS_COLORS: Record<ChatSession["status"], string> = {
  idle: "bg-gray-100 text-gray-800",
  executing: "bg-blue-100 text-blue-800",
  waiting_approval: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
};

export function ChatHeader({ status, onReset }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-background">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">AI Agent Commerce</h1>
          <p className="text-sm text-muted-foreground">
            AI 에이전트와 대화하여 쇼핑몰을 관리하세요
          </p>
        </div>
      </div>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-3">
        <Badge className={STATUS_COLORS[status]}>
          {STATUS_LABELS[status]}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              새 대화 시작
            </DropdownMenuItem>
            <DropdownMenuItem>
              <History className="w-4 h-4 mr-2" />
              대화 이력
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              설정
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default ChatHeader;
```

---

## Step 3: Message List

### `src/components/chat/MessageList.tsx`

```tsx
/**
 * Message List
 *
 * Scrollable list of chat messages
 */

"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "./MessageItem";
import type { ChatMessage } from "@/types/chat";

export interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-4 max-w-3xl mx-auto">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <span className="text-3xl">AI</span>
      </div>
      <h2 className="text-xl font-semibold mb-2">무엇을 도와드릴까요?</h2>
      <p className="text-muted-foreground max-w-md">
        상품 등록, 가격 책정, 고객 문의 응대 등<br />
        AI 에이전트가 쇼핑몰 운영을 도와드립니다.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
        <SuggestionChip text="이 상품 올려줘" />
        <SuggestionChip text="오늘 문의 정리해줘" />
        <SuggestionChip text="배송 지연 건 확인해줘" />
        <SuggestionChip text="할인 캠페인 만들어줘" />
      </div>
    </div>
  );
}

function SuggestionChip({ text }: { text: string }) {
  const { sendMessage } = useChatStore();

  return (
    <button
      onClick={() => sendMessage(text)}
      className="px-3 py-2 text-left rounded-lg border hover:bg-accent transition-colors"
    >
      {text}
    </button>
  );
}

// Import store for suggestion chips
import { useChatStore } from "@/lib/stores/chatStore";

export default MessageList;
```

---

## Step 4: Message Item

### `src/components/chat/MessageItem.tsx`

```tsx
/**
 * Message Item
 *
 * Individual message renderer with type-specific rendering
 */

import { cn } from "@/lib/utils/cn";
import type { ChatMessage } from "@/types/chat";
import { ThoughtMessage } from "@/components/messages/ThoughtMessage";
import { AgentStatusMessage } from "@/components/messages/AgentStatusMessage";
import { ProgressMessage } from "@/components/messages/ProgressMessage";
import { ApprovalMessage } from "@/components/messages/ApprovalMessage";
import { ResultMessage } from "@/components/messages/ResultMessage";
import { ErrorMessage } from "@/components/messages/ErrorMessage";
import { UserMessage } from "@/components/messages/UserMessage";
import { InfoMessage } from "@/components/messages/InfoMessage";

export interface MessageItemProps {
  message: ChatMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  return (
    <div
      className={cn(
        "flex",
        message.role === "user" ? "justify-end" : "justify-start"
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
        <div className="text-muted-foreground text-sm">
          Unknown message type
        </div>
      );
  }
}

export default MessageItem;
```

---

## Step 5: Chat Input

### `src/components/chat/ChatInput.tsx`

```tsx
/**
 * Chat Input
 *
 * Text input with attachment support
 */

"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/lib/stores/chatStore";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ChatInputProps {
  disabled?: boolean;
}

export function ChatInput({ disabled = false }: ChatInputProps) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { sendMessage } = useChatStore();

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!text.trim() && attachments.length === 0) return;
    if (isSubmitting || disabled) return;

    setIsSubmitting(true);

    try {
      // Convert attachments to base64 if images
      const imageUrls: string[] = [];
      for (const file of attachments) {
        if (file.type.startsWith("image/")) {
          const base64 = await fileToBase64(file);
          imageUrls.push(base64);
        }
      }

      // Send message
      await sendMessage(text.trim(), imageUrls.length > 0 ? imageUrls : undefined);

      // Clear input
      setText("");
      setAttachments([]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [text, attachments, isSubmitting, disabled, sendMessage]);

  // Handle key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      setAttachments((prev) => [...prev, ...imageFiles].slice(0, 5)); // Max 5 files
    },
    []
  );

  // Remove attachment
  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Auto-resize textarea
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);

      // Auto-resize
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    },
    []
  );

  return (
    <div className="border-t bg-background p-4">
      {/* Attachment preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="relative w-16 h-16 rounded-lg overflow-hidden border"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeAttachment(index)}
                className="absolute top-0 right-0 p-0.5 bg-black/50 rounded-bl-lg"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          multiple
          className="hidden"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="shrink-0"
        >
          <ImageIcon className="w-5 h-5" />
        </Button>

        {/* Text input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? "AI 에이전트가 작업 중입니다..."
                : "메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
            }
            disabled={disabled}
            className={cn(
              "min-h-[44px] max-h-[200px] resize-none pr-12",
              disabled && "opacity-50"
            )}
            rows={1}
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSubmit}
          disabled={
            disabled ||
            isSubmitting ||
            (!text.trim() && attachments.length === 0)
          }
          className="shrink-0"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Character count */}
      <div className="flex justify-end mt-1">
        <span className="text-xs text-muted-foreground">
          {text.length}/2000
        </span>
      </div>
    </div>
  );
}

// Helper: Convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default ChatInput;
```

---

## Step 6: User Message Component

### `src/components/messages/UserMessage.tsx`

```tsx
/**
 * User Message Component
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils/format";
import type { UserInputMessage } from "@/types/chat";

export interface UserMessageProps {
  message: UserInputMessage;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex flex-col items-end gap-1">
      {/* Message bubble */}
      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-md">
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>

      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="flex gap-2 mt-1">
          {message.attachments.map((attachment) => (
            <img
              key={attachment.id}
              src={attachment.url}
              alt={attachment.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Timestamp */}
      <span className="text-xs text-muted-foreground">
        {formatRelativeTime(message.timestamp)}
      </span>
    </div>
  );
}

export default UserMessage;
```

---

## Step 7: Info Message Component

### `src/components/messages/InfoMessage.tsx`

```tsx
/**
 * Info Message Component
 */

import { Info } from "lucide-react";
import type { InfoMessage as InfoMessageType } from "@/types/chat";

export interface InfoMessageProps {
  message: InfoMessageType;
}

export function InfoMessage({ message }: InfoMessageProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
      <Info className="w-4 h-4" />
      <span>{message.content}</span>
    </div>
  );
}

export default InfoMessage;
```

---

## Step 8: Component Exports

### `src/components/chat/index.ts`

```typescript
export { ChatContainer } from "./ChatContainer";
export { ChatHeader } from "./ChatHeader";
export { ChatInput } from "./ChatInput";
export { MessageList } from "./MessageList";
export { MessageItem } from "./MessageItem";
export { SSEStatus } from "./SSEStatus";
```

### `src/components/messages/index.ts`

```typescript
export { UserMessage } from "./UserMessage";
export { InfoMessage } from "./InfoMessage";
// Will be implemented in next document
export { ThoughtMessage } from "./ThoughtMessage";
export { AgentStatusMessage } from "./AgentStatusMessage";
export { ProgressMessage } from "./ProgressMessage";
export { ApprovalMessage } from "./ApprovalMessage";
export { ResultMessage } from "./ResultMessage";
export { ErrorMessage } from "./ErrorMessage";
```

---

## UI Preview

```
┌─────────────────────────────────────────────────────────────────────┐
│  [AI]  AI Agent Commerce                              [대기 중] [...] │
│        AI 에이전트와 대화하여 쇼핑몰을 관리하세요                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                         [AI Logo]                                   │
│                                                                     │
│                    무엇을 도와드릴까요?                               │
│        상품 등록, 가격 책정, 고객 문의 응대 등                        │
│        AI 에이전트가 쇼핑몰 운영을 도와드립니다.                       │
│                                                                     │
│           [이 상품 올려줘]  [오늘 문의 정리해줘]                       │
│           [배송 지연 건 확인]  [할인 캠페인 만들어줘]                   │
│                                                                     │
│                                                                     │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  [📎]  [메시지를 입력하세요... (Shift+Enter로 줄바꿈)]      [Send]    │
│                                                         0/2000      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Next Step

다음 문서 [05_MESSAGE_TYPES.md](./05_MESSAGE_TYPES.md)에서 메시지 타입별 렌더링 컴포넌트를 구현합니다.
