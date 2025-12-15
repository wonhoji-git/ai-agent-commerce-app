# 08. Testing & Mock Data Guide

## Overview

인증 없이 프론트엔드를 테스트하기 위한 Mock 데이터와 테스트 시나리오를 제공합니다.
백엔드 API 없이도 UI 개발 및 테스트가 가능합니다.

---

## Step 1: Mock SSE Server (Development)

### `src/lib/mocks/mockSSE.ts`

```typescript
/**
 * Mock SSE Server for Development
 *
 * Simulates SSE events for testing without backend
 */

import type { SSEEvent, SSEEventType } from "@/types/sse";
import type { AgentCode } from "@/types/agent";

// Event callback type
type SSEEventCallback = (event: SSEEvent) => void;

// Mock SSE connection
class MockSSEConnection {
  private callback: SSEEventCallback;
  private isRunning: boolean = false;
  private timeouts: NodeJS.Timeout[] = [];

  constructor(callback: SSEEventCallback) {
    this.callback = callback;
  }

  // Start mock event sequence
  start(scenario: "product" | "cs" | "campaign" = "product") {
    this.isRunning = true;
    const events = getMockEventSequence(scenario);

    events.forEach(({ event, delay }) => {
      const timeout = setTimeout(() => {
        if (this.isRunning) {
          this.callback(event);
        }
      }, delay);
      this.timeouts.push(timeout);
    });
  }

  // Stop mock events
  stop() {
    this.isRunning = false;
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }
}

// Create mock event
function createEvent(
  type: SSEEventType,
  data: Record<string, unknown>
): SSEEvent {
  return {
    event_type: type,
    event_id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    timestamp: new Date().toISOString(),
    data,
  } as SSEEvent;
}

// Get mock event sequence for different scenarios
function getMockEventSequence(
  scenario: "product" | "cs" | "campaign"
): { event: SSEEvent; delay: number }[] {
  switch (scenario) {
    case "product":
      return getProductRegistrationSequence();
    case "cs":
      return getCSResponseSequence();
    case "campaign":
      return getCampaignCreationSequence();
    default:
      return getProductRegistrationSequence();
  }
}

// Product registration scenario
function getProductRegistrationSequence() {
  return [
    {
      delay: 500,
      event: createEvent("thought", {
        agent: "SUPERVISOR",
        thought: "상품 이미지를 분석하고 상세페이지를 생성해야 합니다.",
        next_agent: "MD",
      }),
    },
    {
      delay: 1500,
      event: createEvent("agent_start", {
        agent: "MD",
        task: "이미지 분석 및 상세페이지 생성",
      }),
    },
    {
      delay: 2500,
      event: createEvent("progress", {
        agent: "MD",
        step: "image_analysis",
        progress: 20,
        message: "이미지 분석 중...",
      }),
    },
    {
      delay: 3500,
      event: createEvent("progress", {
        agent: "MD",
        step: "image_analysis",
        progress: 50,
        message: "상품 속성 추출 중...",
      }),
    },
    {
      delay: 4500,
      event: createEvent("progress", {
        agent: "MD",
        step: "price_research",
        progress: 70,
        message: "시장가 분석 중...",
      }),
    },
    {
      delay: 5500,
      event: createEvent("progress", {
        agent: "MD",
        step: "html_generation",
        progress: 90,
        message: "상세페이지 생성 중...",
      }),
    },
    {
      delay: 6500,
      event: createEvent("approval_required", {
        approval_id: "apr_mock_123",
        thread_id: "thread_mock_123",
        type: "PRICE_CONFIRMATION",
        status: "PENDING",
        agent: "MD",
        data: {
          suggested_price: 39000,
          reasoning: "유사 상품 분석 결과 평균가 대비 적정 가격입니다.",
          market_price_range: {
            min: 29000,
            max: 49000,
            avg: 38000,
          },
        },
        options: [
          { label: "승인", value: "approve" },
          { label: "수정", value: "modify" },
          { label: "거절", value: "reject" },
        ],
        created_at: new Date().toISOString(),
      }),
    },
  ];
}

// CS response scenario
function getCSResponseSequence() {
  return [
    {
      delay: 500,
      event: createEvent("thought", {
        agent: "SUPERVISOR",
        thought: "고객 문의 의도를 분석하고 적절한 답변을 생성해야 합니다.",
        next_agent: "CS",
      }),
    },
    {
      delay: 1500,
      event: createEvent("agent_start", {
        agent: "CS",
        task: "문의 분석 및 답변 생성",
      }),
    },
    {
      delay: 2500,
      event: createEvent("progress", {
        agent: "CS",
        step: "intent_analysis",
        progress: 30,
        message: "문의 의도 분석 중...",
      }),
    },
    {
      delay: 3500,
      event: createEvent("progress", {
        agent: "CS",
        step: "sentiment_analysis",
        progress: 50,
        message: "고객 감정 분석 중...",
      }),
    },
    {
      delay: 4500,
      event: createEvent("progress", {
        agent: "CS",
        step: "response_generation",
        progress: 80,
        message: "답변 생성 중...",
      }),
    },
    {
      delay: 5500,
      event: createEvent("approval_required", {
        approval_id: "apr_mock_456",
        thread_id: "thread_mock_456",
        type: "CS_RESPONSE_APPROVAL",
        status: "PENDING",
        agent: "CS",
        data: {
          inquiry_content: "주문한 지 3일이 지났는데 아직 배송이 시작 안됐어요.",
          draft_response:
            "안녕하세요, 고객님. 불편을 드려 정말 죄송합니다. 확인 결과, 고객님의 주문 상품은 현재 출고 준비 중이며, 오늘 중으로 발송될 예정입니다. 배송이 시작되면 알림을 보내드리겠습니다. 추가 문의사항이 있으시면 말씀해 주세요.",
          confidence: 0.88,
          sentiment: "NEGATIVE",
        },
        options: [
          { label: "승인", value: "approve" },
          { label: "수정", value: "modify" },
          { label: "거절", value: "reject" },
        ],
        created_at: new Date().toISOString(),
      }),
    },
  ];
}

// Campaign creation scenario
function getCampaignCreationSequence() {
  return [
    {
      delay: 500,
      event: createEvent("thought", {
        agent: "SUPERVISOR",
        thought: "마케팅 캠페인을 생성하고 타겟 고객을 분석해야 합니다.",
        next_agent: "MARKETING",
      }),
    },
    {
      delay: 1500,
      event: createEvent("agent_start", {
        agent: "MARKETING",
        task: "캠페인 생성 및 타겟팅",
      }),
    },
    {
      delay: 3000,
      event: createEvent("progress", {
        agent: "MARKETING",
        step: "audience_analysis",
        progress: 40,
        message: "타겟 오디언스 분석 중...",
      }),
    },
    {
      delay: 4500,
      event: createEvent("progress", {
        agent: "MARKETING",
        step: "copy_generation",
        progress: 70,
        message: "광고 카피 생성 중...",
      }),
    },
    {
      delay: 6000,
      event: createEvent("agent_complete", {
        agent: "MARKETING",
        result: {
          campaign_nm: "겨울 신상 프로모션",
          audience_size: 1500,
          predicted_roas: 3.2,
        },
        confidence: 0.85,
        duration_ms: 4500,
      }),
    },
    {
      delay: 7000,
      event: createEvent("complete", {
        thread_id: "thread_mock_789",
        final_result: {
          summary: "마케팅 캠페인이 생성되었습니다.",
          campaign_no: 101,
          campaign_nm: "겨울 신상 프로모션",
          audience_size: 1500,
        },
        total_time_ms: 6500,
      }),
    },
  ];
}

// Export mock SSE connection creator
export function createMockSSE(callback: SSEEventCallback): MockSSEConnection {
  return new MockSSEConnection(callback);
}

// Continue approval flow (call after user approves)
export function getMockApprovalContinuation(): { event: SSEEvent; delay: number }[] {
  return [
    {
      delay: 500,
      event: createEvent("agent_complete", {
        agent: "MD",
        result: {
          prod_nm: "여름 린넨 원피스",
          sale_amt: 35000,
          category: "여성의류",
        },
        confidence: 0.92,
        duration_ms: 6000,
      }),
    },
    {
      delay: 1500,
      event: createEvent("thought", {
        agent: "SUPERVISOR",
        thought: "상품 등록이 완료되었습니다. 메인 노출을 설정하겠습니다.",
        next_agent: "DISPLAY",
      }),
    },
    {
      delay: 2500,
      event: createEvent("agent_start", {
        agent: "DISPLAY",
        task: "메인 페이지 노출 설정",
      }),
    },
    {
      delay: 3500,
      event: createEvent("agent_complete", {
        agent: "DISPLAY",
        result: {
          main_display: true,
          position: 5,
        },
        confidence: 0.95,
        duration_ms: 1000,
      }),
    },
    {
      delay: 4500,
      event: createEvent("complete", {
        thread_id: "thread_mock_123",
        final_result: {
          summary: "상품 등록이 완료되었습니다. 메인 페이지 5번째 위치에 노출됩니다.",
          prod_no: 12345,
          prod_nm: "여름 린넨 원피스",
          sale_amt: 35000,
        },
        total_time_ms: 10000,
      }),
    },
  ];
}

export default MockSSEConnection;
```

---

## Step 2: Mock API Handlers

### `src/lib/mocks/mockAPI.ts`

```typescript
/**
 * Mock API Handlers
 *
 * Simulates API responses for testing
 */

import type { AgentExecuteResponse, AgentStatusResponse, ApprovalRequest } from "@/types/agent";

// Mock agent execute
export function mockExecuteAgent(): AgentExecuteResponse {
  const threadId = `thread_mock_${Date.now()}`;
  return {
    thread_id: threadId,
    status: "STARTED",
    estimated_completion: new Date(Date.now() + 30000).toISOString(),
    stream_url: `/api/v1/sse/agent/${threadId}`,
  };
}

// Mock agent status
export function mockAgentStatus(threadId: string): AgentStatusResponse {
  return {
    thread_id: threadId,
    status: "IN_PROGRESS",
    current_agent: "MD",
    current_step: "image_analysis",
    progress_percent: 45,
    started_at: new Date(Date.now() - 5000).toISOString(),
    agent_results: {
      SUPERVISOR: {
        status: "COMPLETED",
        steps_completed: ["routing"],
        steps_remaining: [],
      },
      MD: {
        status: "IN_PROGRESS",
        steps_completed: ["image_analysis"],
        steps_remaining: ["price_research", "html_generation"],
      },
    } as any,
    pending_approval: null,
  };
}

// Mock pending approvals
export function mockPendingApprovals(): ApprovalRequest[] {
  return [
    {
      approval_id: "apr_mock_001",
      thread_id: "thread_mock_001",
      type: "PRICE_CONFIRMATION",
      status: "PENDING",
      agent: "MD",
      data: {
        suggested_price: 45000,
        reasoning: "유사 상품 대비 적정가",
      },
      options: [
        { label: "승인", value: "approve" },
        { label: "수정", value: "modify" },
        { label: "거절", value: "reject" },
      ],
      created_at: new Date(Date.now() - 60000).toISOString(),
    },
    {
      approval_id: "apr_mock_002",
      thread_id: "thread_mock_002",
      type: "CS_RESPONSE_APPROVAL",
      status: "PENDING",
      agent: "CS",
      data: {
        inquiry_content: "상품 교환 요청",
        draft_response: "교환 접수되었습니다.",
        confidence: 0.9,
      },
      options: [
        { label: "승인", value: "approve" },
        { label: "수정", value: "modify" },
        { label: "거절", value: "reject" },
      ],
      created_at: new Date(Date.now() - 120000).toISOString(),
    },
  ];
}

// Mock agents list
export function mockAgentsList() {
  return {
    agents: [
      { code: "SUPERVISOR", name: "슈퍼바이저 AI", type: "SUPERVISOR" },
      { code: "MD", name: "MD AI", type: "SUBAGENT" },
      { code: "CS", name: "CS AI", type: "SUBAGENT" },
      { code: "DISPLAY", name: "전시 AI", type: "SUBAGENT" },
      { code: "PURCHASE", name: "구매/결제 AI", type: "SUBAGENT" },
      { code: "LOGISTICS", name: "물류 AI", type: "SUBAGENT" },
      { code: "MARKETING", name: "마케팅 AI", type: "SUBAGENT" },
    ],
  };
}
```

---

## Step 3: Mock Mode Hook

### `src/lib/hooks/useMockMode.ts`

```typescript
/**
 * Mock Mode Hook
 *
 * Enables mock mode for development without backend
 */

import { useEffect, useCallback, useState } from "react";
import { useChatStore } from "@/lib/stores/chatStore";
import { createMockSSE, getMockApprovalContinuation } from "@/lib/mocks/mockSSE";
import type { SSEEvent } from "@/types/sse";

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

export function useMockMode() {
  const [mockSSE, setMockSSE] = useState<ReturnType<typeof createMockSSE> | null>(null);
  const {
    addThoughtMessage,
    addAgentStatusMessage,
    addProgressMessage,
    addApprovalMessage,
    addResultMessage,
    addErrorMessage,
    setSessionStatus,
    setThreadId,
  } = useChatStore();

  // Handle mock SSE events
  const handleMockEvent = useCallback(
    (event: SSEEvent) => {
      console.log("[MockSSE] Event:", event.event_type, event.data);

      switch (event.event_type) {
        case "thought":
          addThoughtMessage(event.data as any);
          break;
        case "agent_start":
          addAgentStatusMessage({ ...event.data, status: "started" } as any);
          break;
        case "progress":
          addProgressMessage(event.data as any);
          break;
        case "agent_complete":
          addAgentStatusMessage({ ...event.data, status: "completed" } as any);
          break;
        case "approval_required":
          addApprovalMessage(event.data as any);
          setSessionStatus("waiting_approval");
          break;
        case "complete":
          addResultMessage(event.data as any);
          setSessionStatus("completed");
          break;
        case "error":
          addErrorMessage(event.data as any);
          setSessionStatus("error");
          break;
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

  // Start mock scenario
  const startMockScenario = useCallback(
    (scenario: "product" | "cs" | "campaign" = "product") => {
      if (!MOCK_MODE) return;

      // Set mock thread ID
      setThreadId(`thread_mock_${Date.now()}`);
      setSessionStatus("executing");

      // Create and start mock SSE
      const sse = createMockSSE(handleMockEvent);
      setMockSSE(sse);
      sse.start(scenario);
    },
    [handleMockEvent, setThreadId, setSessionStatus]
  );

  // Continue after approval
  const continueMockAfterApproval = useCallback(() => {
    if (!MOCK_MODE) return;

    const events = getMockApprovalContinuation();
    events.forEach(({ event, delay }) => {
      setTimeout(() => handleMockEvent(event), delay);
    });
    setSessionStatus("executing");
  }, [handleMockEvent, setSessionStatus]);

  // Cleanup
  useEffect(() => {
    return () => {
      mockSSE?.stop();
    };
  }, [mockSSE]);

  return {
    isMockMode: MOCK_MODE,
    startMockScenario,
    continueMockAfterApproval,
    stopMock: () => mockSSE?.stop(),
  };
}

export default useMockMode;
```

---

## Step 4: Test Scenarios

### Test Scenario 1: Product Registration

```
1. User: "이 상품 올려줘" + 이미지 첨부
2. Expected Events:
   - thought: 슈퍼바이저가 MD Agent 호출 결정
   - agent_start: MD Agent 시작
   - progress: 이미지 분석 20% → 50% → 70% → 90%
   - approval_required: 가격 확인 요청 (39,000원)
3. User: 승인 버튼 클릭
4. Expected Events:
   - agent_complete: MD Agent 완료
   - thought: Display Agent 호출 결정
   - agent_start/complete: Display Agent
   - complete: 최종 결과
```

### Test Scenario 2: CS Response

```
1. User: "오늘 문의 정리해줘"
2. Expected Events:
   - thought: CS Agent 호출
   - agent_start: CS Agent 시작
   - progress: 의도 분석 → 감정 분석 → 답변 생성
   - approval_required: CS 답변 승인 요청
3. User: 수정 후 승인
4. Expected Events:
   - agent_complete: CS Agent 완료
   - complete: 최종 결과
```

### Test Scenario 3: Error Handling

```
1. SSE 연결 끊김 시뮬레이션
2. Expected Behavior:
   - SSEStatus: "연결 끊김" 표시
   - 자동 재연결 시도 (3초 간격, 최대 5회)
   - 재연결 실패 시 에러 메시지 표시
```

---

## Step 5: Development Commands

### `.env.local` for Mock Mode

```env
# Enable mock mode (no backend required)
NEXT_PUBLIC_MOCK_MODE=true

# API URL (ignored in mock mode)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Test seller number
NEXT_PUBLIC_TEST_SELLER_NO=1
```

### Running Development Server

```bash
# With mock mode (no backend)
NEXT_PUBLIC_MOCK_MODE=true npm run dev

# With real backend
NEXT_PUBLIC_MOCK_MODE=false npm run dev
```

---

## Step 6: Debug Panel Integration

### `src/app/page.tsx` (with Debug)

```tsx
"use client";

import { useState } from "react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { SSEDebugPanel } from "@/components/debug/SSEDebugPanel";
import { useMockMode } from "@/lib/hooks/useMockMode";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [debugEvents, setDebugEvents] = useState<any[]>([]);
  const { isMockMode, startMockScenario } = useMockMode();

  return (
    <main className="h-screen bg-background">
      <ChatContainer />

      {/* Debug controls (development only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 z-50 space-y-2">
          {isMockMode && (
            <div className="space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => startMockScenario("product")}
              >
                Mock: 상품 등록
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => startMockScenario("cs")}
              >
                Mock: CS 응대
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => startMockScenario("campaign")}
              >
                Mock: 캠페인
              </Button>
            </div>
          )}
        </div>
      )}

      {/* SSE Debug panel */}
      {process.env.NODE_ENV === "development" && (
        <SSEDebugPanel events={debugEvents} />
      )}
    </main>
  );
}
```

---

## Step 7: Checklist

### Development Checklist

- [ ] Next.js 프로젝트 생성 완료
- [ ] shadcn/ui 컴포넌트 설치 완료
- [ ] TailwindCSS 설정 완료
- [ ] API 클라이언트 구현 완료
- [ ] SSE 훅 구현 완료
- [ ] Chat UI 컴포넌트 구현 완료
- [ ] 메시지 타입 컴포넌트 구현 완료
- [ ] 승인 워크플로우 구현 완료
- [ ] Zustand 스토어 구현 완료
- [ ] Mock 모드 구현 완료

### Testing Checklist

- [ ] Mock 모드에서 상품 등록 시나리오 테스트
- [ ] Mock 모드에서 CS 응대 시나리오 테스트
- [ ] Mock 모드에서 캠페인 생성 시나리오 테스트
- [ ] 승인/수정/거절 플로우 테스트
- [ ] SSE 재연결 테스트
- [ ] 에러 핸들링 테스트

### Integration Checklist

- [ ] 백엔드 API 연결 확인
- [ ] SSE 연결 확인
- [ ] 실제 에이전트 실행 테스트
- [ ] 승인 API 연동 확인

---

## Quick Start Summary

```bash
# 1. 프로젝트 생성
npx create-next-app@latest ai-agent-chat --typescript --tailwind --eslint --app

# 2. 의존성 설치
cd ai-agent-chat
npm install axios @tanstack/react-query zustand immer lucide-react
npm install date-fns react-hook-form zod @hookform/resolvers
npm install clsx tailwind-merge class-variance-authority

# 3. shadcn/ui 설정
npx shadcn@latest init
npx shadcn@latest add button input textarea card badge avatar scroll-area progress alert dialog toast form

# 4. 환경 변수 설정
echo "NEXT_PUBLIC_MOCK_MODE=true" >> .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" >> .env.local
echo "NEXT_PUBLIC_TEST_SELLER_NO=1" >> .env.local

# 5. 개발 서버 실행
npm run dev
```

---

## Conclusion

이 문서들을 순서대로 따라하면 AI Agent Commerce 백엔드와 연동하는 완전한 채팅 UI를 구축할 수 있습니다.

Mock 모드를 활용하면 백엔드 없이도 UI 개발 및 테스트가 가능합니다.

**Happy Coding!**
