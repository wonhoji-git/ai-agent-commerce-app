/**
 * Info Message
 *
 * 시스템 정보 메시지
 */

import { Info } from "lucide-react";
import type { InfoMessage as InfoMessageType } from "@/types/chat";

export interface InfoMessageProps {
  message: InfoMessageType;
}

export function InfoMessage({ message }: InfoMessageProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2 px-3 bg-muted/30 rounded-lg">
      <Info className="w-4 h-4 flex-shrink-0" />
      <span>{message.content}</span>
    </div>
  );
}

export default InfoMessage;
