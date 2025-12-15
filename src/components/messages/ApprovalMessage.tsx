"use client";

/**
 * Approval Message
 *
 * 승인 요청 메시지 (Placeholder - Phase 7에서 완성)
 */

import { AlertTriangle, Check, X, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentBadge } from "@/components/ui/agent-badge";
import { formatRelativeTime, formatCurrency } from "@/lib/utils";
import { useChatStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import type { ApprovalMessage as ApprovalMessageType } from "@/types/chat";

export interface ApprovalMessageProps {
  message: ApprovalMessageType;
}

export function ApprovalMessage({ message }: ApprovalMessageProps) {
  const { approval, responded, response } = message;
  const isResolved = responded || approval.status !== "PENDING";
  const respondToApproval = useChatStore((state) => state.respondToApproval);

  const handleApprove = () => {
    respondToApproval(approval.approval_id, "APPROVED");
  };

  const handleReject = () => {
    respondToApproval(approval.approval_id, "REJECTED");
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-sm transition-all",
        isResolved
          ? "border-muted bg-muted/30"
          : "border-warning/50 bg-warning/5"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle
            className={cn(
              "w-5 h-5",
              isResolved ? "text-muted-foreground" : "text-warning"
            )}
          />
          <span
            className={cn(
              "font-semibold",
              isResolved ? "text-muted-foreground" : "text-warning"
            )}
          >
            {getApprovalTitle(approval.type)}
          </span>
        </div>
        <AgentBadge agent={approval.agent} size="sm" />
      </div>

      {/* Content */}
      <ApprovalContent approval={approval} />

      {/* Response status */}
      {isResolved && response && (
        <div className="pt-3 mt-3 border-t">
          <div className="flex items-center gap-2 text-sm">
            {response.decision === "APPROVED" && (
              <>
                <Check className="w-4 h-4 text-success" />
                <span className="text-success">승인됨</span>
              </>
            )}
            {response.decision === "REJECTED" && (
              <>
                <X className="w-4 h-4 text-error" />
                <span className="text-error">거절됨</span>
              </>
            )}
            {response.decision === "MODIFIED" && (
              <>
                <Edit2 className="w-4 h-4 text-primary" />
                <span className="text-primary">수정 후 승인</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!isResolved && (
        <div className="flex gap-2 pt-3 mt-3 border-t">
          <Button onClick={handleApprove} size="sm" className="flex-1">
            <Check className="w-4 h-4 mr-1" />
            승인
          </Button>
          <Button variant="secondary" size="sm" className="flex-1">
            <Edit2 className="w-4 h-4 mr-1" />
            수정
          </Button>
          <Button variant="destructive" size="sm" className="flex-1" onClick={handleReject}>
            <X className="w-4 h-4 mr-1" />
            거절
          </Button>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-muted-foreground mt-3">
        {formatRelativeTime(message.timestamp)}
      </div>
    </div>
  );
}

// Approval content based on type
function ApprovalContent({ approval }: { approval: ApprovalMessageType["approval"] }) {
  const { type, data } = approval;

  if (type === "PRICE_CONFIRMATION") {
    const suggestedPrice = data.suggested_price as number;
    const reasoning = data.reasoning as string | undefined;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">제안 가격</span>
          <span className="text-xl font-bold text-warning">
            {formatCurrency(suggestedPrice)}
          </span>
        </div>
        {reasoning && (
          <p className="text-sm text-muted-foreground">
            {reasoning}
          </p>
        )}
      </div>
    );
  }

  if (type === "PRODUCT_APPROVAL") {
    const imageUrl = data.image_url as string | undefined;
    const prodNm = data.prod_nm as string;
    const categoryNm = data.category_nm as string;
    const saleAmt = data.sale_amt as number;
    return (
      <div className="space-y-2">
        <div className="flex gap-3">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={prodNm}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          <div>
            <h4 className="font-medium">{prodNm}</h4>
            <p className="text-sm text-muted-foreground">
              {categoryNm}
            </p>
            <p className="font-semibold">{formatCurrency(saleAmt)}</p>
          </div>
        </div>
      </div>
    );
  }

  // Default: show JSON
  return (
    <div className="bg-white/50 rounded-lg p-3 text-xs border">
      <pre className="overflow-auto max-h-24 text-muted-foreground">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

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
