# 06. Approval Workflow UI

## Overview

AI 에이전트가 중요한 결정을 내릴 때 사용자의 승인을 요청하는 워크플로우 UI를 구현합니다.
가격 확인, 상품 등록 승인, 캠페인 승인 등 다양한 승인 유형을 지원합니다.

---

## Step 1: Approval Message Component

### `src/components/messages/ApprovalMessage.tsx`

```tsx
/**
 * Approval Message Component
 *
 * Interactive approval request from agent
 */

"use client";

import { useState } from "react";
import { AlertTriangle, Check, X, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgentBadge } from "@/components/ui/agent-badge";
import { formatRelativeTime } from "@/lib/utils/format";
import { useChatStore } from "@/lib/stores/chatStore";
import { ApprovalModifyDialog } from "./ApprovalModifyDialog";
import type { ApprovalMessage as ApprovalMessageType } from "@/types/chat";

export interface ApprovalMessageProps {
  message: ApprovalMessageType;
}

export function ApprovalMessage({ message }: ApprovalMessageProps) {
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { respondToApproval } = useChatStore();

  const { approval, responded, response } = message;
  const isResolved = responded || approval.status !== "PENDING";

  // Handle approve
  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await respondToApproval(approval.approval_id, "APPROVED");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await respondToApproval(approval.approval_id, "REJECTED");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle modify
  const handleModify = async (modifications: Record<string, unknown>) => {
    setIsProcessing(true);
    try {
      await respondToApproval(approval.approval_id, "MODIFIED", modifications);
      setIsModifyOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card
        className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ${
          isResolved
            ? "border-muted bg-muted/30"
            : "border-yellow-300 bg-yellow-50/50 shadow-md"
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={`w-5 h-5 ${
                  isResolved ? "text-muted-foreground" : "text-yellow-600"
                }`}
              />
              <CardTitle
                className={`text-base ${
                  isResolved ? "text-muted-foreground" : "text-yellow-800"
                }`}
              >
                {getApprovalTitle(approval.type)}
              </CardTitle>
            </div>
            <AgentBadge agent={approval.agent} size="sm" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Approval content based on type */}
          <ApprovalContent approval={approval} />

          {/* Response status (if resolved) */}
          {isResolved && response && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm">
                {response.decision === "APPROVED" && (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">승인됨</span>
                  </>
                )}
                {response.decision === "REJECTED" && (
                  <>
                    <X className="w-4 h-4 text-red-600" />
                    <span className="text-red-700">거절됨</span>
                  </>
                )}
                {response.decision === "MODIFIED" && (
                  <>
                    <Edit2 className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700">수정 후 승인</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action buttons (if not resolved) */}
          {!isResolved && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                승인
              </Button>
              <Button
                onClick={() => setIsModifyOpen(true)}
                disabled={isProcessing}
                variant="secondary"
                className="flex-1"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                수정
              </Button>
              <Button
                onClick={handleReject}
                disabled={isProcessing}
                variant="destructive"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                거절
              </Button>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground">
            {formatRelativeTime(message.timestamp)}
          </div>
        </CardContent>
      </Card>

      {/* Modify dialog */}
      <ApprovalModifyDialog
        open={isModifyOpen}
        onOpenChange={setIsModifyOpen}
        approval={approval}
        onSubmit={handleModify}
        isProcessing={isProcessing}
      />
    </>
  );
}

// Get approval title based on type
function getApprovalTitle(type: string): string {
  const titles: Record<string, string> = {
    PRICE_CONFIRMATION: "가격 확인 요청",
    PRODUCT_APPROVAL: "상품 등록 승인",
    CAMPAIGN_APPROVAL: "캠페인 승인",
    CS_RESPONSE_APPROVAL: "CS 답변 승인",
    HIGH_VALUE_ORDER: "고가 주문 승인",
    GENERAL: "승인 요청",
  };
  return titles[type] || "승인 요청";
}

export default ApprovalMessage;
```

---

## Step 2: Approval Content Components

### `src/components/messages/ApprovalContent.tsx`

```tsx
/**
 * Approval Content Component
 *
 * Renders different approval types
 */

import { formatCurrency } from "@/lib/utils/format";
import type { ApprovalRequest } from "@/types/agent";

export interface ApprovalContentProps {
  approval: ApprovalRequest;
}

export function ApprovalContent({ approval }: ApprovalContentProps) {
  switch (approval.type) {
    case "PRICE_CONFIRMATION":
      return <PriceConfirmationContent data={approval.data} />;

    case "PRODUCT_APPROVAL":
      return <ProductApprovalContent data={approval.data} />;

    case "CAMPAIGN_APPROVAL":
      return <CampaignApprovalContent data={approval.data} />;

    case "CS_RESPONSE_APPROVAL":
      return <CSResponseApprovalContent data={approval.data} />;

    default:
      return <DefaultApprovalContent data={approval.data} />;
  }
}

// Price Confirmation
function PriceConfirmationContent({ data }: { data: Record<string, unknown> }) {
  const suggestedPrice = data.suggested_price as number;
  const reasoning = data.reasoning as string;
  const marketPriceRange = data.market_price_range as {
    min: number;
    max: number;
    avg: number;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">제안 가격</span>
        <span className="text-2xl font-bold text-yellow-800">
          {formatCurrency(suggestedPrice)}
        </span>
      </div>

      {marketPriceRange && (
        <div className="bg-white/50 rounded-lg p-3 text-sm">
          <div className="text-xs text-muted-foreground mb-2">시장 가격 분석</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-muted-foreground text-xs">최저가</div>
              <div className="font-medium">
                {formatCurrency(marketPriceRange.min)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">평균가</div>
              <div className="font-medium text-primary">
                {formatCurrency(marketPriceRange.avg)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">최고가</div>
              <div className="font-medium">
                {formatCurrency(marketPriceRange.max)}
              </div>
            </div>
          </div>
        </div>
      )}

      {reasoning && (
        <div className="text-sm text-muted-foreground">
          <strong>분석 근거:</strong> {reasoning}
        </div>
      )}
    </div>
  );
}

// Product Approval
function ProductApprovalContent({ data }: { data: Record<string, unknown> }) {
  const prodNm = data.prod_nm as string;
  const categoryNm = data.category_nm as string;
  const saleAmt = data.sale_amt as number;
  const imageUrl = data.image_url as string;
  const qualityScore = data.quality_score as number;

  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={prodNm}
            className="w-20 h-20 object-cover rounded-lg"
          />
        )}
        <div className="flex-1 space-y-1">
          <h4 className="font-medium">{prodNm}</h4>
          <div className="text-sm text-muted-foreground">{categoryNm}</div>
          <div className="text-lg font-bold">{formatCurrency(saleAmt)}</div>
        </div>
      </div>

      {qualityScore !== undefined && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">품질 점수</span>
          <span
            className={`font-medium ${
              qualityScore >= 80
                ? "text-green-600"
                : qualityScore >= 60
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {qualityScore}점
          </span>
        </div>
      )}
    </div>
  );
}

// Campaign Approval
function CampaignApprovalContent({ data }: { data: Record<string, unknown> }) {
  const campaignNm = data.campaign_nm as string;
  const campaignType = data.campaign_type as string;
  const budgetAmt = data.budget_amt as number;
  const targetAudience = data.target_audience as number;
  const expectedRoas = data.expected_roas as number;

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium">{campaignNm}</h4>
        <div className="text-sm text-muted-foreground">{campaignType}</div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center bg-white/50 rounded-lg p-3">
        <div>
          <div className="text-xs text-muted-foreground">예산</div>
          <div className="font-medium">{formatCurrency(budgetAmt)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">타겟</div>
          <div className="font-medium">{targetAudience?.toLocaleString()}명</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">예상 ROAS</div>
          <div className="font-medium text-green-600">
            {expectedRoas?.toFixed(1)}x
          </div>
        </div>
      </div>
    </div>
  );
}

// CS Response Approval
function CSResponseApprovalContent({ data }: { data: Record<string, unknown> }) {
  const inquiryContent = data.inquiry_content as string;
  const draftResponse = data.draft_response as string;
  const confidence = data.confidence as number;
  const sentiment = data.sentiment as string;

  return (
    <div className="space-y-3">
      <div className="bg-white/50 rounded-lg p-3">
        <div className="text-xs text-muted-foreground mb-1">고객 문의</div>
        <p className="text-sm">{inquiryContent}</p>
      </div>

      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-blue-600">AI 답변 초안</span>
          {confidence && (
            <span className="text-xs text-muted-foreground">
              신뢰도: {Math.round(confidence * 100)}%
            </span>
          )}
        </div>
        <p className="text-sm">{draftResponse}</p>
      </div>

      {sentiment && (
        <div className="text-xs text-muted-foreground">
          감정 분석: {getSentimentLabel(sentiment)}
        </div>
      )}
    </div>
  );
}

// Default Approval
function DefaultApprovalContent({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="bg-white/50 rounded-lg p-3 text-sm">
      <pre className="overflow-auto max-h-32 text-muted-foreground">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

// Helper: Get sentiment label
function getSentimentLabel(sentiment: string): string {
  const labels: Record<string, string> = {
    POSITIVE: "긍정적",
    NEUTRAL: "중립",
    NEGATIVE: "부정적",
    ANGRY: "화남",
  };
  return labels[sentiment] || sentiment;
}

export default ApprovalContent;
```

---

## Step 3: Approval Modify Dialog

### `src/components/messages/ApprovalModifyDialog.tsx`

```tsx
/**
 * Approval Modify Dialog
 *
 * Dialog for modifying approval data before approving
 */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { ApprovalRequest } from "@/types/agent";

export interface ApprovalModifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approval: ApprovalRequest;
  onSubmit: (modifications: Record<string, unknown>) => Promise<void>;
  isProcessing: boolean;
}

export function ApprovalModifyDialog({
  open,
  onOpenChange,
  approval,
  onSubmit,
  isProcessing,
}: ApprovalModifyDialogProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // Initialize form data from approval data
  useEffect(() => {
    if (open) {
      setFormData({ ...approval.data });
    }
  }, [open, approval.data]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  // Render form fields based on approval type
  const renderFormFields = () => {
    switch (approval.type) {
      case "PRICE_CONFIRMATION":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="suggested_price">수정 가격</Label>
              <Input
                id="suggested_price"
                type="number"
                value={(formData.suggested_price as number) || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    suggested_price: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="가격 입력"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">수정 사유</Label>
              <Textarea
                id="comment"
                value={(formData.comment as string) || ""}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                placeholder="가격 수정 사유를 입력하세요"
              />
            </div>
          </div>
        );

      case "PRODUCT_APPROVAL":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prod_nm">상품명</Label>
              <Input
                id="prod_nm"
                value={(formData.prod_nm as string) || ""}
                onChange={(e) =>
                  setFormData({ ...formData, prod_nm: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale_amt">판매가</Label>
              <Input
                id="sale_amt"
                type="number"
                value={(formData.sale_amt as number) || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sale_amt: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
        );

      case "CS_RESPONSE_APPROVAL":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="draft_response">답변 내용</Label>
              <Textarea
                id="draft_response"
                value={(formData.draft_response as string) || ""}
                onChange={(e) =>
                  setFormData({ ...formData, draft_response: e.target.value })
                }
                rows={5}
                placeholder="답변 내용을 수정하세요"
              />
            </div>
          </div>
        );

      case "CAMPAIGN_APPROVAL":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign_nm">캠페인명</Label>
              <Input
                id="campaign_nm"
                value={(formData.campaign_nm as string) || ""}
                onChange={(e) =>
                  setFormData({ ...formData, campaign_nm: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget_amt">예산</Label>
              <Input
                id="budget_amt"
                type="number"
                value={(formData.budget_amt as number) || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget_amt: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>데이터 (JSON)</Label>
              <Textarea
                value={JSON.stringify(formData, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData(JSON.parse(e.target.value));
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                rows={10}
                className="font-mono text-xs"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>수정 후 승인</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {renderFormFields()}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              취소
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  처리 중...
                </>
              ) : (
                "수정 후 승인"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ApprovalModifyDialog;
```

---

## Step 4: Approval Hook

### `src/lib/hooks/useApproval.ts`

```typescript
/**
 * Approval Hook
 *
 * Manages approval workflow
 */

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as approvalApi from "@/lib/api/approvals";
import { useChatStore } from "@/lib/stores/chatStore";
import { agentKeys } from "./useAgentQuery";

export function useApproval() {
  const queryClient = useQueryClient();
  const { updateApprovalMessage, addInfoMessage, setSessionStatus } =
    useChatStore();

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({
      approvalId,
      modifications,
      comment,
    }: {
      approvalId: string;
      modifications?: Record<string, unknown>;
      comment?: string;
    }) => approvalApi.approve(approvalId, modifications, comment),
    onSuccess: (_, variables) => {
      updateApprovalMessage(variables.approvalId, "APPROVED");
      addInfoMessage("승인이 완료되었습니다.");
      setSessionStatus("executing"); // Continue execution
    },
    onError: (error) => {
      console.error("Approval failed:", error);
      addInfoMessage("승인 처리 중 오류가 발생했습니다.");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({
      approvalId,
      comment,
    }: {
      approvalId: string;
      comment?: string;
    }) => approvalApi.reject(approvalId, comment),
    onSuccess: (_, variables) => {
      updateApprovalMessage(variables.approvalId, "REJECTED");
      addInfoMessage("승인이 거절되었습니다.");
      setSessionStatus("idle");
    },
    onError: (error) => {
      console.error("Rejection failed:", error);
      addInfoMessage("거절 처리 중 오류가 발생했습니다.");
    },
  });

  // Modify and approve mutation
  const modifyMutation = useMutation({
    mutationFn: ({
      approvalId,
      modifications,
      comment,
    }: {
      approvalId: string;
      modifications: Record<string, unknown>;
      comment?: string;
    }) => approvalApi.modifyAndApprove(approvalId, modifications, comment),
    onSuccess: (_, variables) => {
      updateApprovalMessage(
        variables.approvalId,
        "MODIFIED",
        variables.modifications
      );
      addInfoMessage("수정 사항이 반영되어 승인되었습니다.");
      setSessionStatus("executing");
    },
    onError: (error) => {
      console.error("Modify and approve failed:", error);
      addInfoMessage("수정 승인 처리 중 오류가 발생했습니다.");
    },
  });

  // Respond to approval
  const respondToApproval = useCallback(
    async (
      approvalId: string,
      decision: "APPROVED" | "REJECTED" | "MODIFIED",
      modifications?: Record<string, unknown>,
      comment?: string
    ) => {
      switch (decision) {
        case "APPROVED":
          await approveMutation.mutateAsync({
            approvalId,
            modifications,
            comment,
          });
          break;
        case "REJECTED":
          await rejectMutation.mutateAsync({ approvalId, comment });
          break;
        case "MODIFIED":
          if (modifications) {
            await modifyMutation.mutateAsync({
              approvalId,
              modifications,
              comment,
            });
          }
          break;
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
    [approveMutation, rejectMutation, modifyMutation, queryClient]
  );

  return {
    respondToApproval,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isModifying: modifyMutation.isPending,
    isProcessing:
      approveMutation.isPending ||
      rejectMutation.isPending ||
      modifyMutation.isPending,
  };
}

export default useApproval;
```

---

## Step 5: Pending Approvals Panel

### `src/components/approvals/PendingApprovalsPanel.tsx`

```tsx
/**
 * Pending Approvals Panel
 *
 * Shows list of pending approvals
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell, AlertTriangle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getPendingApprovals } from "@/lib/api/approvals";
import { formatRelativeTime } from "@/lib/utils/format";
import type { ApprovalRequest } from "@/types/agent";

export interface PendingApprovalsPanelProps {
  onSelect?: (approval: ApprovalRequest) => void;
}

export function PendingApprovalsPanel({
  onSelect,
}: PendingApprovalsPanelProps) {
  const { data: approvals, isLoading, error } = useQuery({
    queryKey: ["approvals", "pending"],
    queryFn: getPendingApprovals,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="w-4 h-4" />
            대기 중인 승인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-4 text-center text-muted-foreground text-sm">
          승인 목록을 불러올 수 없습니다.
        </CardContent>
      </Card>
    );
  }

  if (!approvals || approvals.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="w-4 h-4" />
            대기 중인 승인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground text-sm py-4">
            대기 중인 승인 요청이 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="w-4 h-4" />
            대기 중인 승인
          </CardTitle>
          <Badge variant="secondary">{approvals.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-64">
          <div className="divide-y">
            {approvals.map((approval) => (
              <ApprovalItem
                key={approval.approval_id}
                approval={approval}
                onSelect={onSelect}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Individual approval item
function ApprovalItem({
  approval,
  onSelect,
}: {
  approval: ApprovalRequest;
  onSelect?: (approval: ApprovalRequest) => void;
}) {
  return (
    <button
      onClick={() => onSelect?.(approval)}
      className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              {getApprovalTypeLabel(approval.type)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(approval.created_at)}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </button>
  );
}

// Get approval type label
function getApprovalTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PRICE_CONFIRMATION: "가격 확인",
    PRODUCT_APPROVAL: "상품 등록",
    CAMPAIGN_APPROVAL: "캠페인",
    CS_RESPONSE_APPROVAL: "CS 답변",
    HIGH_VALUE_ORDER: "고가 주문",
    GENERAL: "일반",
  };
  return labels[type] || type;
}

export default PendingApprovalsPanel;
```

---

## Approval Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                      Approval Workflow                                 │
└───────────────────────────────────────────────────────────────────────┘

      Agent Execution                          User Interface
            │                                        │
            │  [approval_required event]             │
            │───────────────────────────────────────▶│
            │                                        │
            │                                 ┌──────┴──────┐
            │                                 │ApprovalMessage│
            │                                 │             │
            │                                 │ [승인]      │
            │                                 │ [수정]      │
            │                                 │ [거절]      │
            │                                 └──────┬──────┘
            │                                        │
            │          [User clicks 수정]            │
            │                                        │
            │                                 ┌──────┴──────┐
            │                                 │ModifyDialog │
            │                                 │             │
            │                                 │ 가격: [   ] │
            │                                 │ 사유: [   ] │
            │                                 │             │
            │                                 │[수정 후 승인]│
            │                                 └──────┬──────┘
            │                                        │
            │   POST /approvals/{id}/approve         │
            │◀───────────────────────────────────────│
            │   { decision: "MODIFIED",              │
            │     modifications: {...} }             │
            │                                        │
            │  [Continue execution]                  │
            │                                        │
            │  [complete event]                      │
            │───────────────────────────────────────▶│
            │                                        │
```

---

## Next Step

다음 문서 [07_STATE_MANAGEMENT.md](./07_STATE_MANAGEMENT.md)에서 Zustand 상태 관리를 구현합니다.
