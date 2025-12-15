/**
 * Result Message
 *
 * 작업 완료 결과 표시
 */

import { CheckCircle2, Clock, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatRelativeTime, formatCurrency } from "@/lib/utils";
import type { ResultMessage as ResultMessageType } from "@/types/chat";

export interface ResultMessageProps {
  message: ResultMessageType;
}

export function ResultMessage({ message }: ResultMessageProps) {
  return (
    <div className="rounded-xl border border-success/30 bg-success/5 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <span className="font-semibold text-success">작업 완료</span>
        </div>
        <Badge variant="success" className="text-xs">
          <Clock className="w-3 h-3 mr-1" />
          {formatDuration(message.total_time_ms)}
        </Badge>
      </div>

      {/* Summary - rendered as markdown */}
      <div className="text-sm mb-3 prose prose-sm prose-neutral dark:prose-invert max-w-none [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mt-4 [&>h1]:mb-2 [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mt-3 [&>h2]:mb-2 [&>h3]:text-sm [&>h3]:font-medium [&>p]:my-2 [&>ul]:my-2 [&>ol]:my-2 [&>li]:my-0.5">
        <ReactMarkdown>{message.summary}</ReactMarkdown>
      </div>

      {/* Details */}
      {message.details && <ResultDetails details={message.details} />}

      {/* Timestamp */}
      <div className="text-xs text-muted-foreground mt-3">
        {formatRelativeTime(message.timestamp)}
      </div>
    </div>
  );
}

// Result details component
function ResultDetails({ details }: { details: Record<string, unknown> }) {
  // Product result
  if ("prod_no" in details) {
    const prodNo = details.prod_no as number;
    const prodNm = details.prod_nm as string;
    const saleAmt = details.sale_amt as number;

    return (
      <div className="bg-white/50 rounded-lg p-3 space-y-2 border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {prodNm || `상품 #${prodNo}`}
          </span>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            <ExternalLink className="w-3 h-3 mr-1" />
            상품 보기
          </Button>
        </div>
        {saleAmt && (
          <div className="text-xs text-muted-foreground">
            판매가: {formatCurrency(saleAmt)}
          </div>
        )}
      </div>
    );
  }

  // Campaign result
  if ("campaign_no" in details) {
    const campaignNo = details.campaign_no as number;
    const campaignNm = details.campaign_nm as string;

    return (
      <div className="bg-white/50 rounded-lg p-3 space-y-2 border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {campaignNm || `캠페인 #${campaignNo}`}
          </span>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            <ExternalLink className="w-3 h-3 mr-1" />
            캠페인 보기
          </Button>
        </div>
      </div>
    );
  }

  // Default: show as JSON
  return (
    <div className="bg-white/50 rounded-lg p-3 text-xs border">
      <pre className="overflow-auto max-h-32 text-muted-foreground">
        {JSON.stringify(details, null, 2)}
      </pre>
    </div>
  );
}

export default ResultMessage;
