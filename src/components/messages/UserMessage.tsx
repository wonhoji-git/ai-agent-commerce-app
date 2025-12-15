/**
 * User Message
 *
 * 사용자 입력 메시지 컴포넌트
 */

import { formatRelativeTime } from "@/lib/utils";
import type { UserInputMessage } from "@/types/chat";

export interface UserMessageProps {
  message: UserInputMessage;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex flex-col items-end gap-1">
      {/* Message bubble */}
      <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-tr-md shadow-sm">
        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
      </div>

      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="flex gap-2 mt-1">
          {message.attachments.map((attachment) => (
            <img
              key={attachment.id}
              src={attachment.url}
              alt={attachment.name}
              className="w-24 h-24 object-cover rounded-lg shadow-sm"
            />
          ))}
        </div>
      )}

      {/* Timestamp */}
      <span className="text-xs text-muted-foreground">
        {formatRelativeTime(message.timestamp)}
      </span>
    </div>
  );
}

export default UserMessage;
