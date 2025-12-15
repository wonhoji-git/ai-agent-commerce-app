# Phase 7: Approval Workflow - 진행 기록

## 상태: 완료

## 목표
승인 워크플로우 UI 구현

## 구현 항목
- ApprovalMessage.tsx - 승인 요청 메시지 (Phase 6에서 구현)
- 수정 다이얼로그 (Dialog 컴포넌트 추가)

## 승인 타입
- PRICE_CONFIRMATION: 가격 확인 요청
- PRODUCT_APPROVAL: 상품 등록 승인
- CAMPAIGN_APPROVAL: 캠페인 승인
- CS_RESPONSE_APPROVAL: CS 답변 승인
- HIGH_VALUE_ORDER: 고가 주문 승인
- GENERAL: 일반 승인

## 워크플로우
1. SSE로 approval_required 이벤트 수신
2. ApprovalMessage 렌더링
3. 사용자 승인/수정/거절 선택
4. API 호출 → 상태 업데이트
5. 작업 계속 또는 종료
