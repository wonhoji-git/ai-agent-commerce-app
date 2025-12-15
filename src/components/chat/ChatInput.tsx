"use client";

/**
 * Chat Input
 *
 * 메시지 입력 영역 - 텍스트 입력, 이미지 첨부
 */

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { Send, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

export interface ChatInputProps {
  disabled?: boolean;
}

export function ChatInput({ disabled = false }: ChatInputProps) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useChatStore((state) => state.sendMessage);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!text.trim() && attachments.length === 0) return;
    if (isSubmitting || disabled) return;

    setIsSubmitting(true);

    try {
      // Convert attachments to base64 if images
      const imageUrls: string[] = [];
      for (const file of attachments) {
        if (file.type.startsWith("image/")) {
          const base64 = await fileToBase64(file);
          imageUrls.push(base64);
        }
      }

      // Send message
      await sendMessage(text.trim(), imageUrls.length > 0 ? imageUrls : undefined);

      // Clear input
      setText("");
      setAttachments([]);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [text, attachments, isSubmitting, disabled, sendMessage]);

  // Handle key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      setAttachments((prev) => [...prev, ...imageFiles].slice(0, 5));
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  // Remove attachment
  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Auto-resize textarea
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);

      // Auto-resize
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    },
    []
  );

  return (
    <div className="border-t bg-card p-4 shadow-sm">
      {/* Attachment preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="relative w-16 h-16 rounded-lg overflow-hidden border shadow-sm group"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeAttachment(index)}
                className="absolute top-0 right-0 p-1 bg-black/60 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          multiple
          className="hidden"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="shrink-0 h-10 w-10"
        >
          <ImageIcon className="w-5 h-5" />
          <span className="sr-only">이미지 첨부</span>
        </Button>

        {/* Text input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? "AI 에이전트가 작업 중입니다..."
                : "메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
            }
            disabled={disabled}
            className={cn(
              "min-h-[44px] max-h-[200px] pr-4",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            rows={1}
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSubmit}
          disabled={
            disabled || isSubmitting || (!text.trim() && attachments.length === 0)
          }
          className="shrink-0 h-10 px-4"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="sr-only">전송</span>
        </Button>
      </div>

      {/* Character count */}
      <div className="flex justify-end mt-2">
        <span
          className={cn(
            "text-xs",
            text.length > 1800 ? "text-warning" : "text-muted-foreground"
          )}
        >
          {text.length}/2000
        </span>
      </div>
    </div>
  );
}

// Helper: Convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default ChatInput;
