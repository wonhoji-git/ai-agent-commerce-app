# Phase 2: Types & API Client - 진행 기록

## 상태: 진행 중

## 목표
TypeScript 타입 정의 및 API 클라이언트 구현

## 파일 목록
- `src/types/agent.ts` - 에이전트 관련 타입
- `src/types/chat.ts` - 채팅 메시지 타입
- `src/types/sse.ts` - SSE 이벤트 타입
- `src/types/api.ts` - API 응답 타입
- `src/lib/api/client.ts` - Axios 클라이언트
- `src/lib/api/agents.ts` - 에이전트 API
- `src/lib/api/approvals.ts` - 승인 API

## 타입 정의

### Agent Types
- AgentCode: SUPERVISOR, MD, CS, DISPLAY, PURCHASE, LOGISTICS, MARKETING
- ApprovalType: PRICE_CONFIRMATION, PRODUCT_APPROVAL, CAMPAIGN_APPROVAL 등
- ApprovalStatus: PENDING, APPROVED, REJECTED, MODIFIED

### Chat Message Types
- user_input: 사용자 입력
- thought: 슈퍼바이저 사고 과정
- agent_status: 에이전트 상태 (started/completed/failed)
- progress: 진행률 표시
- approval: 승인 요청
- result: 최종 결과
- error: 오류
- info: 시스템 정보
