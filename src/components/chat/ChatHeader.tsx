/**
 * Chat Header
 *
 * 헤더 영역 - 로고, 상태, 메뉴
 */

import { Bot, MoreVertical, RefreshCw, History, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ChatSessionStatus } from "@/types/chat";

export interface ChatHeaderProps {
  status: ChatSessionStatus;
  onReset: () => void;
}

const STATUS_CONFIG: Record<
  ChatSessionStatus,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "error" }
> = {
  idle: { label: "대기 중", variant: "secondary" },
  executing: { label: "실행 중", variant: "default" },
  waiting_approval: { label: "승인 대기", variant: "warning" },
  completed: { label: "완료", variant: "success" },
  error: { label: "오류", variant: "error" },
};

export function ChatHeader({ status, onReset }: ChatHeaderProps) {
  const statusConfig = STATUS_CONFIG[status];

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-card shadow-sm">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            AI Agent Commerce
          </h1>
          <p className="text-sm text-muted-foreground">
            AI 에이전트와 대화하여 쇼핑몰을 관리하세요
          </p>
        </div>
      </div>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-3">
        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onReset}>
              <RefreshCw className="w-4 h-4" />
              새 대화 시작
            </DropdownMenuItem>
            <DropdownMenuItem>
              <History className="w-4 h-4" />
              대화 이력
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="w-4 h-4" />
              설정
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default ChatHeader;
