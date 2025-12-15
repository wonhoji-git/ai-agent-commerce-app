/**
 * Agent Badge
 *
 * 에이전트 타입별 뱃지 컴포넌트
 */

import {
  Bot,
  ShoppingBag,
  MessageCircle,
  Layout,
  CreditCard,
  Truck,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentCode } from "@/types/agent";

export interface AgentBadgeProps {
  agent: AgentCode;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const AGENT_CONFIG: Record<
  AgentCode,
  { label: string; className: string; icon: React.ElementType }
> = {
  SUPERVISOR: {
    label: "슈퍼바이저",
    className: "agent-supervisor",
    icon: Bot,
  },
  MD: {
    label: "MD",
    className: "agent-md",
    icon: ShoppingBag,
  },
  CS: {
    label: "CS",
    className: "agent-cs",
    icon: MessageCircle,
  },
  DISPLAY: {
    label: "전시",
    className: "agent-display",
    icon: Layout,
  },
  PURCHASE: {
    label: "결제",
    className: "agent-purchase",
    icon: CreditCard,
  },
  LOGISTICS: {
    label: "물류",
    className: "agent-logistics",
    icon: Truck,
  },
  MARKETING: {
    label: "마케팅",
    className: "agent-marketing",
    icon: Megaphone,
  },
};

const SIZE_CONFIG = {
  sm: { badge: "px-2 py-0.5 text-xs gap-1", icon: "w-3 h-3" },
  md: { badge: "px-2.5 py-1 text-xs gap-1.5", icon: "w-3.5 h-3.5" },
  lg: { badge: "px-3 py-1.5 text-sm gap-2", icon: "w-4 h-4" },
};

export function AgentBadge({
  agent,
  size = "md",
  showLabel = true,
  className,
}: AgentBadgeProps) {
  const config = AGENT_CONFIG[agent] ?? {
    label: agent || "Unknown",
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
    icon: Bot,
  };
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        config.className,
        sizeConfig.badge,
        className
      )}
    >
      <Icon className={sizeConfig.icon} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

export default AgentBadge;
