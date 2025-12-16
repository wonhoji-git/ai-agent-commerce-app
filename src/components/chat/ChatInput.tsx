"use client";

/**
 * Chat Input
 *
 * 메시지 입력 영역 - 텍스트 입력, 이미지 첨부
 */

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { Send, Image as ImageIcon, X, Loader2, Upload, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { uploadImage, validateImageFile, type UploadOptions } from "@/lib/api/images";

export interface ChatInputProps {
  disabled?: boolean;
  /** true면 이미지를 서버에 업로드, false면 base64 인코딩 */
  uploadToServer?: boolean;
  /** 이미지 업로드 폴더 (예: "products", "reviews") */
  uploadFolder?: string;
}

interface AttachmentItem {
  file: File;
  preview: string;
  status: "pending" | "uploading" | "uploaded" | "error";
  uploadedUrl?: string;
  uploadedKey?: string;
  error?: string;
}

export function ChatInput({ disabled = false, uploadToServer = true, uploadFolder = "products" }: ChatInputProps) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useChatStore((state) => state.sendMessage);

  // 서버에 이미지 업로드
  const uploadAttachmentsToServer = useCallback(async () => {
    const pendingAttachments = attachments.filter(a => a.status === "pending");
    if (pendingAttachments.length === 0) return;

    setIsUploading(true);

    // 각 첨부파일 업로드 상태를 uploading으로 변경
    setAttachments(prev => prev.map(a =>
      a.status === "pending" ? { ...a, status: "uploading" as const } : a
    ));

    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];
      if (attachment.status !== "pending" && attachment.status !== "uploading") continue;

      try {
        // 폴더 옵션과 함께 업로드
        const response = await uploadImage(attachment.file, { folder: uploadFolder });
        setAttachments(prev => prev.map((a, idx) =>
          idx === i ? {
            ...a,
            status: "uploaded" as const,
            uploadedUrl: response.data.url,    // response.data.url 형식
            uploadedKey: response.data.key     // response.data.key 형식
          } : a
        ));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "업로드 실패";
        setAttachments(prev => prev.map((a, idx) =>
          idx === i ? { ...a, status: "error" as const, error: errorMessage } : a
        ));
      }
    }

    setIsUploading(false);
  }, [attachments, uploadFolder]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!text.trim() && attachments.length === 0) return;
    if (isSubmitting || disabled || isUploading) return;

    setIsSubmitting(true);

    try {
      const imageUrls: string[] = [];

      if (uploadToServer) {
        // 서버 업로드 모드: pending 이미지 먼저 업로드
        const pendingAttachments = attachments.filter(a => a.status === "pending");

        // pending 이미지가 있으면 먼저 업로드
        for (const attachment of pendingAttachments) {
          try {
            const response = await uploadImage(attachment.file, { folder: uploadFolder });
            imageUrls.push(response.data.url);
          } catch (error) {
            console.error("Failed to upload image:", error);
            // 업로드 실패한 이미지는 건너뛰고 계속 진행
          }
        }

        // 이미 업로드된 이미지 URL 추가
        for (const attachment of attachments) {
          if (attachment.status === "uploaded" && attachment.uploadedUrl) {
            imageUrls.push(attachment.uploadedUrl);
          }
        }
      } else {
        // Base64 모드: 파일을 base64로 변환
        for (const attachment of attachments) {
          if (attachment.file.type.startsWith("image/")) {
            const base64 = await fileToBase64(attachment.file);
            imageUrls.push(base64);
          }
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
  }, [text, attachments, isSubmitting, disabled, isUploading, uploadToServer, uploadFolder, sendMessage]);

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
      const newAttachments: AttachmentItem[] = [];

      for (const file of files) {
        // 이미지 파일만 허용
        if (!file.type.startsWith("image/")) continue;

        // 유효성 검사
        const validation = validateImageFile(file);
        const preview = URL.createObjectURL(file);

        newAttachments.push({
          file,
          preview,
          status: validation.valid ? "pending" : "error",
          error: validation.error
        });
      }

      setAttachments((prev) => [...prev, ...newAttachments].slice(0, 5));

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  // Remove attachment
  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => {
      const removed = prev[index];
      // preview URL 해제
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
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
        <div className="mb-3">
          <div className="flex gap-2 flex-wrap">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className={cn(
                  "relative w-16 h-16 rounded-lg overflow-hidden border shadow-sm group",
                  attachment.status === "error" && "border-red-500",
                  attachment.status === "uploaded" && "border-green-500",
                  attachment.status === "uploading" && "border-blue-500 animate-pulse"
                )}
              >
                <img
                  src={attachment.preview}
                  alt={attachment.file.name}
                  className="w-full h-full object-cover"
                />
                {/* 상태 오버레이 */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  {attachment.status === "uploading" && (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  )}
                  {attachment.status === "uploaded" && (
                    <Check className="w-5 h-5 text-green-400" />
                  )}
                  {attachment.status === "error" && (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  {attachment.status === "pending" && uploadToServer && (
                    <Upload className="w-5 h-5 text-white/70" />
                  )}
                </div>
                {/* 삭제 버튼 */}
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute top-0 right-0 p-1 bg-black/60 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
                {/* 에러 툴팁 */}
                {attachment.error && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-[10px] p-0.5 truncate">
                    {attachment.error}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* 업로드 버튼 (선택사항 - 전송 시 자동 업로드됨) */}
          {uploadToServer && attachments.some(a => a.status === "pending") && (
            <Button
              size="sm"
              variant="outline"
              onClick={uploadAttachmentsToServer}
              disabled={isUploading}
              className="mt-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3 mr-1" />
                  미리 업로드
                </>
              )}
            </Button>
          )}
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
            disabled ||
            isSubmitting ||
            isUploading ||
            (!text.trim() && attachments.length === 0) ||
            (attachments.length > 0 && attachments.every(a => a.status === "error"))
          }
          className="shrink-0 h-10 px-4"
          title={
            attachments.some(a => a.status === "pending")
              ? "전송 시 이미지가 자동 업로드됩니다"
              : undefined
          }
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
