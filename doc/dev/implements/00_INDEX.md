# AI Agent Commerce - Frontend Chat UI Development Guide

## Overview

이 문서는 AI Agent Commerce 백엔드 API와 연동하는 채팅 기반 프론트엔드 UI 개발을 위한 작업 지시서입니다.
인증 없이 테스트 가능한 채팅 인터페이스를 React + Next.js + TypeScript로 구현합니다.

---

## Project Summary

### Backend API Base URL
```
http://localhost:8000/api/v1
```

### Key Features
1. **AI Agent Chat Interface**: 자연어로 AI 에이전트에 명령 전달
2. **Real-time Streaming (SSE)**: 에이전트 실행 상태 실시간 표시
3. **Approval Workflow**: 중요 결정에 대한 승인/수정 UI
4. **Agent Response Rendering**: 에이전트 응답 타입별 렌더링

### Tech Stack
| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 14+ (App Router) |
| Language | TypeScript | 5.0+ |
| Styling | TailwindCSS | 3.4+ |
| UI Components | shadcn/ui | Latest |
| State Management | Zustand | 4.5+ |
| Server State | TanStack Query | 5.0+ |
| HTTP Client | Axios | 1.7+ |
| Icons | Lucide React | Latest |

---

## Document Structure

| No | Document | Description |
|----|----------|-------------|
| **00** | [INDEX.md](./00_INDEX.md) | 개발 가이드 개요 및 목차 (본 문서) |
| **01** | [PROJECT_SETUP.md](./01_PROJECT_SETUP.md) | Next.js 프로젝트 초기 설정 |
| **02** | [API_CLIENT.md](./02_API_CLIENT.md) | API 클라이언트 및 타입 정의 |
| **03** | [SSE_STREAMING.md](./03_SSE_STREAMING.md) | SSE 연동 및 실시간 이벤트 처리 |
| **04** | [CHAT_UI_COMPONENTS.md](./04_CHAT_UI_COMPONENTS.md) | 채팅 UI 컴포넌트 구현 |
| **05** | [MESSAGE_TYPES.md](./05_MESSAGE_TYPES.md) | 메시지 타입별 렌더링 구현 |
| **06** | [APPROVAL_WORKFLOW.md](./06_APPROVAL_WORKFLOW.md) | 승인 워크플로우 UI 구현 |
| **07** | [STATE_MANAGEMENT.md](./07_STATE_MANAGEMENT.md) | Zustand 상태 관리 구현 |
| **08** | [TESTING_GUIDE.md](./08_TESTING_GUIDE.md) | 테스트 및 Mock 데이터 가이드 |

---

## Backend API Reference

### Core Endpoints (Agent Execution)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/agents/execute` | AI 에이전트 실행 요청 |
| `GET` | `/agents/status/{thread_id}` | 에이전트 실행 상태 조회 |
| `POST` | `/agents/{thread_id}/approve` | 승인 요청 응답 |
| `POST` | `/agents/{thread_id}/cancel` | 에이전트 실행 취소 |
| `GET` | `/agents/history` | 에이전트 실행 이력 조회 |

### SSE Streaming Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/sse/agent/{thread_id}?seller_no={seller_no}` | 에이전트 이벤트 구독 (thread별) |
| `GET` | `/sse/seller/{seller_no}` | 판매자 이벤트 구독 (전체 알림) |
| `GET` | `/sse/approvals/{seller_no}` | 승인 요청 이벤트 구독 |

### Approval Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/approvals/pending` | 대기 중인 승인 요청 목록 |
| `GET` | `/approvals/{approval_id}` | 승인 요청 상세 조회 |
| `POST` | `/approvals/{approval_id}/approve` | 승인 |
| `POST` | `/approvals/{approval_id}/reject` | 거절 |

---

## SSE Event Types

채팅 UI에서 처리해야 할 SSE 이벤트 타입들:

```typescript
type SSEEventType =
  | 'thought'           // 에이전트 사고 과정
  | 'agent_start'       // 서브 에이전트 시작
  | 'progress'          // 진행 상황
  | 'agent_complete'    // 서브 에이전트 완료
  | 'approval_required' // 승인 필요
  | 'complete'          // 전체 완료
  | 'error'             // 에러 발생
  | 'heartbeat';        // 연결 유지
```

### Event Data Examples

```typescript
// thought event
{
  "agent": "SUPERVISOR",
  "thought": "상품 이미지 분석이 필요합니다.",
  "next_agent": "MD",
  "timestamp": "2025-12-12T10:00:00Z"
}

// agent_start event
{
  "agent": "MD",
  "task": "이미지 분석 및 상세페이지 생성",
  "timestamp": "2025-12-12T10:00:01Z"
}

// progress event
{
  "agent": "MD",
  "step": "image_analysis",
  "progress": 30,
  "message": "이미지 분석 중...",
  "timestamp": "2025-12-12T10:00:05Z"
}

// approval_required event
{
  "type": "PRICE_CONFIRMATION",
  "approval_id": "apr_xyz789",
  "data": {
    "suggested_price": 39000,
    "reasoning": "경쟁사 분석 결과 적정가"
  },
  "options": [
    {"label": "승인", "value": "approve"},
    {"label": "수정", "value": "modify"},
    {"label": "거절", "value": "reject"}
  ]
}

// complete event
{
  "thread_id": "aic_thread_abc123",
  "final_result": {
    "summary": "상품 등록이 완료되었습니다.",
    "products_created": 1,
    "prod_no": 12345
  },
  "total_time_ms": 45000
}
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      Pages / App Router                           │  │
│  │  app/                                                             │  │
│  │  ├── page.tsx           (Home - Chat UI)                          │  │
│  │  ├── layout.tsx         (Root Layout)                             │  │
│  │  └── providers.tsx      (React Query, Zustand)                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      Components                                   │  │
│  │  components/                                                      │  │
│  │  ├── chat/                                                        │  │
│  │  │   ├── ChatContainer.tsx                                        │  │
│  │  │   ├── ChatInput.tsx                                            │  │
│  │  │   ├── MessageList.tsx                                          │  │
│  │  │   └── MessageItem.tsx                                          │  │
│  │  ├── messages/                                                    │  │
│  │  │   ├── ThoughtMessage.tsx                                       │  │
│  │  │   ├── AgentStatusMessage.tsx                                   │  │
│  │  │   ├── ApprovalMessage.tsx                                      │  │
│  │  │   └── ResultMessage.tsx                                        │  │
│  │  └── ui/                (shadcn/ui components)                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Services / Hooks                               │  │
│  │  lib/                                                             │  │
│  │  ├── api/                                                         │  │
│  │  │   ├── client.ts       (Axios instance)                         │  │
│  │  │   ├── agents.ts       (Agent API)                              │  │
│  │  │   └── types.ts        (API Types)                              │  │
│  │  ├── hooks/                                                       │  │
│  │  │   ├── useSSE.ts       (SSE connection hook)                    │  │
│  │  │   ├── useAgent.ts     (Agent execution hook)                   │  │
│  │  │   └── useApproval.ts  (Approval workflow hook)                 │  │
│  │  └── stores/                                                      │  │
│  │      └── chatStore.ts    (Zustand store)                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP / SSE
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                                   │
│                  http://localhost:8000/api/v1                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Development Workflow

### Phase 1: Project Setup (01)
1. Next.js 프로젝트 생성
2. TailwindCSS, shadcn/ui 설정
3. 기본 폴더 구조 생성

### Phase 2: API Integration (02)
1. Axios 인스턴스 설정
2. API 타입 정의
3. TanStack Query 설정

### Phase 3: SSE Streaming (03)
1. SSE 연결 훅 구현
2. 이벤트 파싱 및 처리
3. 재연결 로직 구현

### Phase 4: Chat UI (04)
1. ChatContainer 컴포넌트
2. ChatInput 컴포넌트
3. MessageList/MessageItem 컴포넌트

### Phase 5: Message Types (05)
1. 메시지 타입별 컴포넌트 구현
2. 에이전트 상태 표시
3. 프로그레스 바 구현

### Phase 6: Approval Workflow (06)
1. 승인 요청 UI
2. 수정 폼 구현
3. 승인/거절 처리

### Phase 7: State Management (07)
1. Zustand store 설계
2. 채팅 상태 관리
3. 에이전트 상태 동기화

### Phase 8: Testing (08)
1. Mock 데이터 생성
2. 테스트 시나리오
3. 개발 서버 실행 가이드

---

## Quick Start (Development)

```bash
# 1. 프론트엔드 프로젝트 디렉토리로 이동
cd frontend

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 백엔드 API 서버 확인 (별도 터미널)
# http://localhost:8000/api/docs 에서 API 문서 확인
```

### Test Mode Configuration

인증 없이 테스트하기 위한 환경 변수:

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_TEST_SELLER_NO=1
NEXT_PUBLIC_MOCK_MODE=false
```

---

## Notes

- 모든 API 호출 시 `seller_no`는 테스트 모드에서 환경변수로 제공
- SSE 연결은 `seller_no`를 query parameter로 전달
- 승인 워크플로우는 실시간 SSE 이벤트로 트리거됨
- UI는 Linear.app 스타일의 심플한 디자인 지향

---

**Next Step**: [01_PROJECT_SETUP.md](./01_PROJECT_SETUP.md)로 이동하여 프로젝트 설정을 시작하세요.
