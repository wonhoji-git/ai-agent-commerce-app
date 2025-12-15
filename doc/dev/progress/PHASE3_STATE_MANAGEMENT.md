# Phase 3: State Management - 진행 기록

## 상태: 진행 중

## 목표
Zustand를 사용한 채팅 상태 관리 구현

## 파일 목록
- `src/lib/stores/chatStore.ts` - 메인 채팅 스토어
- `src/lib/stores/selectors.ts` - 메모이즈된 셀렉터
- `src/lib/stores/index.ts` - 모듈 익스포트

## 스토어 구조

### State
- session: 현재 채팅 세션
- threadId: SSE 연결용 스레드 ID

### Actions
- initSession: 세션 초기화
- resetSession: 세션 리셋
- sendMessage: 메시지 전송
- addXxxMessage: SSE 이벤트 처리
- respondToApproval: 승인 응답

### Selectors
- useSessionStatus: 세션 상태
- useMessages: 메시지 목록
- useIsExecuting: 실행 중 여부
- usePendingApprovals: 대기 중인 승인

## 미들웨어
- devtools: Redux DevTools 연동
- persist: localStorage 영속화
- immer: 불변성 관리
