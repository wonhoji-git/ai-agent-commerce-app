# 05. Message Type Components

## Overview

SSE 이벤트에 따른 다양한 메시지 타입별 컴포넌트를 구현합니다.
각 에이전트의 상태와 진행 상황을 시각적으로 표현합니다.

---

## Step 1: Agent Badge Component

### `src/components/ui/agent-badge.tsx`

```tsx
/**
 * Agent Badge Component
 *
 * Visual badge for different agent types
 */

import { cn } from "@/lib/utils/cn";
import type { AgentCode } from "@/types/agent";
import {
  Bot,
  ShoppingBag,
  MessageCircle,
  Layout,
  CreditCard,
  Truck,
  Megaphone,
} from "lucide-react";

export interface AgentBadgeProps {
  agent: AgentCode;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const AGENT_CONFIG: Record<
  AgentCode,
  { label: string; color: string; icon: React.ElementType }
> = {
  SUPERVISOR: {
    label: "슈퍼바이저",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: Bot,
  },
  MD: {
    label: "MD",
    color: "bg-violet-100 text-violet-800 border-violet-200",
    icon: ShoppingBag,
  },
  CS: {
    label: "CS",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    icon: MessageCircle,
  },
  DISPLAY: {
    label: "전시",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Layout,
  },
  PURCHASE: {
    label: "결제",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CreditCard,
  },
  LOGISTICS: {
    label: "물류",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: Truck,
  },
  MARKETING: {
    label: "마케팅",
    color: "bg-pink-100 text-pink-800 border-pink-200",
    icon: Megaphone,
  },
};

const SIZE_CONFIG = {
  sm: { badge: "px-2 py-0.5 text-xs", icon: "w-3 h-3" },
  md: { badge: "px-3 py-1 text-sm", icon: "w-4 h-4" },
  lg: { badge: "px-4 py-1.5 text-base", icon: "w-5 h-5" },
};

export function AgentBadge({
  agent,
  size = "md",
  showLabel = true,
  className,
}: AgentBadgeProps) {
  const config = AGENT_CONFIG[agent];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        config.color,
        sizeConfig.badge,
        className
      )}
    >
      <Icon className={sizeConfig.icon} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

export default AgentBadge;
```

---

## Step 2: Thought Message

### `src/components/messages/ThoughtMessage.tsx`

```tsx
/**
 * Thought Message Component
 *
 * Displays supervisor reasoning/thinking process
 */

import { Brain, ArrowRight } from "lucide-react";
import { AgentBadge } from "@/components/ui/agent-badge";
import { formatRelativeTime } from "@/lib/utils/format";
import type { ThoughtMessage as ThoughtMessageType } from "@/types/chat";

export interface ThoughtMessageProps {
  message: ThoughtMessageType;
}

export function ThoughtMessage({ message }: ThoughtMessageProps) {
  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
        <Brain className="w-4 h-4 text-indigo-600" />
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
        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <p className="text-foreground/80 italic">"{message.thought}"</p>
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
```

---

## Step 3: Agent Status Message

### `src/components/messages/AgentStatusMessage.tsx`

```tsx
/**
 * Agent Status Message Component
 *
 * Displays agent start/complete status
 */

import { Play, CheckCircle, XCircle, Clock } from "lucide-react";
import { AgentBadge } from "@/components/ui/agent-badge";
import { formatRelativeTime, formatDuration } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { AgentStatusMessage as AgentStatusMessageType } from "@/types/chat";

export interface AgentStatusMessageProps {
  message: AgentStatusMessageType;
}

export function AgentStatusMessage({ message }: AgentStatusMessageProps) {
  const isStarted = message.status === "started";
  const isCompleted = message.status === "completed";
  const isFailed = message.status === "failed";

  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Status icon */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isStarted && "bg-blue-100",
          isCompleted && "bg-green-100",
          isFailed && "bg-red-100"
        )}
      >
        {isStarted && <Play className="w-4 h-4 text-blue-600" />}
        {isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
        {isFailed && <XCircle className="w-4 h-4 text-red-600" />}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <AgentBadge agent={message.agent} size="sm" />
          <span
            className={cn(
              "text-sm font-medium",
              isStarted && "text-blue-600",
              isCompleted && "text-green-600",
              isFailed && "text-red-600"
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
          <div className="text-sm text-muted-foreground">
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
              <span>
                신뢰도: {Math.round(message.confidence * 100)}%
              </span>
            )}
          </div>
        )}

        {/* Result preview (if available) */}
        {isCompleted && message.result && (
          <AgentResultPreview result={message.result} agent={message.agent} />
        )}
      </div>
    </div>
  );
}

// Result preview component
function AgentResultPreview({
  result,
  agent,
}: {
  result: Record<string, unknown>;
  agent: string;
}) {
  // Show relevant preview based on agent type
  return (
    <div className="bg-muted/30 rounded-lg p-3 text-xs">
      <pre className="overflow-auto max-h-24 text-muted-foreground">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

export default AgentStatusMessage;
```

---

## Step 4: Progress Message

### `src/components/messages/ProgressMessage.tsx`

```tsx
/**
 * Progress Message Component
 *
 * Displays agent progress with progress bar
 */

import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AgentBadge } from "@/components/ui/agent-badge";
import { cn } from "@/lib/utils/cn";
import type { ProgressMessage as ProgressMessageType } from "@/types/chat";

export interface ProgressMessageProps {
  message: ProgressMessageType;
}

export function ProgressMessage({ message }: ProgressMessageProps) {
  const isComplete = message.progress >= 100;

  return (
    <div className="flex gap-3 animate-in fade-in duration-200">
      {/* Spinner/Check */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <Loader2
          className={cn(
            "w-4 h-4 text-blue-600",
            !isComplete && "animate-spin"
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          <AgentBadge agent={message.agent} size="sm" />
          <span className="text-sm text-muted-foreground">
            {message.step}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <Progress value={message.progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{message.message}</span>
            <span>{message.progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressMessage;
```

---

## Step 5: Result Message

### `src/components/messages/ResultMessage.tsx`

```tsx
/**
 * Result Message Component
 *
 * Displays final result from agent execution
 */

import { CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatRelativeTime } from "@/lib/utils/format";
import type { ResultMessage as ResultMessageType } from "@/types/chat";

export interface ResultMessageProps {
  message: ResultMessageType;
}

export function ResultMessage({ message }: ResultMessageProps) {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-green-200 bg-green-50/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <CardTitle className="text-base text-green-800">
              작업 완료
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-green-700 border-green-300">
            <Clock className="w-3 h-3 mr-1" />
            {formatDuration(message.total_time_ms)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Summary */}
        <p className="text-sm">{message.summary}</p>

        {/* Details */}
        {message.details && (
          <ResultDetails details={message.details} />
        )}

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground">
          {formatRelativeTime(message.timestamp)}
        </div>
      </CardContent>
    </Card>
  );
}

// Result details component
function ResultDetails({ details }: { details: Record<string, unknown> }) {
  // Extract common result fields
  const { summary, ...rest } = details;

  // Render based on result type
  if ("prod_no" in rest) {
    return <ProductResult details={rest} />;
  }

  if ("campaign_no" in rest) {
    return <CampaignResult details={rest} />;
  }

  if ("inquiry_no" in rest) {
    return <InquiryResult details={rest} />;
  }

  // Default: show as JSON
  return (
    <div className="bg-white/50 rounded-lg p-3 text-xs">
      <pre className="overflow-auto max-h-32">
        {JSON.stringify(rest, null, 2)}
      </pre>
    </div>
  );
}

// Product result
function ProductResult({ details }: { details: Record<string, unknown> }) {
  const prodNo = details.prod_no as number;
  const prodNm = details.prod_nm as string;
  const saleAmt = details.sale_amt as number;

  return (
    <div className="bg-white/50 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {prodNm || `상품 #${prodNo}`}
        </span>
        <Button variant="ghost" size="sm" className="h-7">
          <ExternalLink className="w-3 h-3 mr-1" />
          상품 보기
        </Button>
      </div>
      {saleAmt && (
        <div className="text-xs text-muted-foreground">
          판매가: {saleAmt.toLocaleString()}원
        </div>
      )}
    </div>
  );
}

// Campaign result
function CampaignResult({ details }: { details: Record<string, unknown> }) {
  const campaignNo = details.campaign_no as number;
  const campaignNm = details.campaign_nm as string;

  return (
    <div className="bg-white/50 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {campaignNm || `캠페인 #${campaignNo}`}
        </span>
        <Button variant="ghost" size="sm" className="h-7">
          <ExternalLink className="w-3 h-3 mr-1" />
          캠페인 보기
        </Button>
      </div>
    </div>
  );
}

// Inquiry result
function InquiryResult({ details }: { details: Record<string, unknown> }) {
  const inquiryNo = details.inquiry_no as number;
  const responded = details.responded as boolean;

  return (
    <div className="bg-white/50 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          문의 #{inquiryNo}
        </span>
        {responded && (
          <Badge variant="secondary">답변 완료</Badge>
        )}
      </div>
    </div>
  );
}

export default ResultMessage;
```

---

## Step 6: Error Message

### `src/components/messages/ErrorMessage.tsx`

```tsx
/**
 * Error Message Component
 */

import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ErrorMessage as ErrorMessageType } from "@/types/chat";

export interface ErrorMessageProps {
  message: ErrorMessageType;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <Alert
      variant="destructive"
      className="animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>오류 발생</span>
        <span className="text-xs font-mono font-normal">
          {message.code}
        </span>
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>{message.message}</p>

        {message.recoverable && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            다시 시도
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

export default ErrorMessage;
```

---

## Step 7: Typing Indicator

### `src/components/messages/TypingIndicator.tsx`

```tsx
/**
 * Typing Indicator Component
 *
 * Shows when agent is processing
 */

import { AgentBadge } from "@/components/ui/agent-badge";
import type { AgentCode } from "@/types/agent";

export interface TypingIndicatorProps {
  agent?: AgentCode;
}

export function TypingIndicator({ agent = "SUPERVISOR" }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 animate-in fade-in duration-300">
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
        <span className="text-sm text-muted-foreground">
          생각 중...
        </span>
      </div>
    </div>
  );
}

export default TypingIndicator;
```

---

## Step 8: Message Components Export

### `src/components/messages/index.ts` (Updated)

```typescript
export { ThoughtMessage } from "./ThoughtMessage";
export { AgentStatusMessage } from "./AgentStatusMessage";
export { ProgressMessage } from "./ProgressMessage";
export { ApprovalMessage } from "./ApprovalMessage";
export { ResultMessage } from "./ResultMessage";
export { ErrorMessage } from "./ErrorMessage";
export { UserMessage } from "./UserMessage";
export { InfoMessage } from "./InfoMessage";
export { TypingIndicator } from "./TypingIndicator";
```

---

## Message Flow Visualization

```
User: "이 상품 올려줘" + [이미지]
         │
         ▼
┌─────────────────────────────────┐
│ [Brain] 슈퍼바이저              │  ThoughtMessage
│ "상품 이미지 분석이 필요합니다" │
│ → 다음: MD Agent               │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ [▶] MD Agent 작업 시작          │  AgentStatusMessage (started)
│ 이미지 분석 및 상세페이지 생성   │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ [●●●] MD Agent                 │  ProgressMessage
│ ████████░░░░░░░░ 50%           │
│ 이미지 분석 중...               │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ [!] 승인 필요                   │  ApprovalMessage
│ 가격: 39,000원                  │  (다음 문서에서 구현)
│ [승인] [수정] [거절]            │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ [✓] 작업 완료                   │  ResultMessage
│ 상품이 등록되었습니다           │
│ 소요 시간: 45초                 │
└─────────────────────────────────┘
```

---

## Next Step

다음 문서 [06_APPROVAL_WORKFLOW.md](./06_APPROVAL_WORKFLOW.md)에서 승인 워크플로우 UI를 구현합니다.
