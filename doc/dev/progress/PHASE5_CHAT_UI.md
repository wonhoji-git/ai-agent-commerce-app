# Phase 5: Chat UI Components - 진행 기록

## 상태: 진행 중

## 목표
채팅 인터페이스의 핵심 UI 컴포넌트 구현

## 파일 목록

### shadcn/ui 기본 컴포넌트
- `src/components/ui/button.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/scroll-area.tsx`
- `src/components/ui/dropdown-menu.tsx`

### Chat 컴포넌트
- `src/components/chat/ChatContainer.tsx` - 메인 컨테이너
- `src/components/chat/ChatHeader.tsx` - 헤더 (로고, 상태, 메뉴)
- `src/components/chat/ChatInput.tsx` - 입력창 (텍스트, 첨부)
- `src/components/chat/MessageList.tsx` - 메시지 목록
- `src/components/chat/MessageItem.tsx` - 개별 메시지
- `src/components/chat/SSEStatus.tsx` - SSE 연결 상태

## 디자인 특징
- Light Theme + Indigo Accent
- Indigo glow 포커스 효과
- 부드러운 카드 그림자
- Staggered 애니메이션
- 반응형 레이아웃
