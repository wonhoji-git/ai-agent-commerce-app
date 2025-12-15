# Phase 4: SSE Hooks - 진행 기록

## 상태: 진행 중

## 목표
Server-Sent Events (SSE) 기반 실시간 스트리밍 연결 구현

## 파일 목록
- `src/lib/hooks/useSSE.ts` - 기본 SSE 연결 훅
- `src/lib/hooks/useAgentSSE.ts` - 에이전트 전용 SSE 훅
- `src/lib/hooks/useAgentQuery.ts` - TanStack Query 훅
- `src/lib/hooks/index.ts` - 모듈 익스포트

## SSE 이벤트 처리
1. connected - 연결 완료
2. thought - 슈퍼바이저 사고 과정
3. agent_started - 에이전트 작업 시작
4. agent_progress - 진행률 업데이트
5. agent_completed - 에이전트 작업 완료
6. agent_failed - 에이전트 작업 실패
7. approval_required - 승인 요청
8. complete - 전체 작업 완료
9. error - 오류 발생
10. heartbeat - 연결 유지

## 재연결 전략
- 최대 5회 재시도
- 지수 백오프 (1s, 2s, 4s, 8s, 16s)
- 하트비트 타임아웃 30초
