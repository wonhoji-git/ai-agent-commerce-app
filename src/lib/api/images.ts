/**
 * 이미지 업로드 API 클라이언트
 *
 * 이미지 업로드, 삭제, 목록 조회 기능
 */

import { apiClient } from "./client";

// ============== Types ==============

/** 업로드된 이미지 데이터 */
export interface ImageData {
  key: string;
  url: string;
  bucket: string;
  filename: string;
  content_type: string;
  size: number;
}

/** 단일 이미지 업로드 응답 */
export interface ImageUploadResponse {
  success: boolean;
  data: ImageData;
}

/** 다중 이미지 업로드 응답 */
export interface MultipleImageUploadResponse {
  success: boolean;
  data: {
    uploaded: ImageData[];
    failed: Array<{ filename: string; error: string }>;
    total_uploaded: number;
    total_failed: number;
  };
}

/** 이미지 목록 응답 */
export interface ImageListResponse {
  success: boolean;
  data: {
    images: ImageData[];
    total: number;
    page: number;
    page_size: number;
  };
}

/** 삭제 응답 */
export interface DeleteResponse {
  success: boolean;
  data: {
    message: string;
    key: string;
  };
}

/** 업로드 옵션 */
export interface UploadOptions {
  folder?: string;  // 저장 폴더 (예: "products", "reviews")
}

// ============== API Functions ==============

/**
 * 단일 이미지 업로드
 *
 * @param file - 업로드할 이미지 파일
 * @param options - 업로드 옵션 (folder 등)
 * @returns 업로드된 이미지 정보
 *
 * @example
 * const result = await uploadImage(file, { folder: 'products' });
 * console.log(result.data.url); // http://localhost:9000/ai-commerce/products/...
 */
export async function uploadImage(
  file: File,
  options?: UploadOptions
): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  if (options?.folder) {
    formData.append("folder", options.folder);
  }

  // FormData 전송 시 Content-Type을 undefined로 설정하여 브라우저가 자동으로 boundary 포함하여 설정하도록 함
  const response = await apiClient.post<ImageUploadResponse>(
    "/images/upload",
    formData,
    {
      headers: {
        "Content-Type": undefined,
      },
    }
  );

  return response.data;
}

/**
 * 다중 이미지 업로드 (최대 10개)
 *
 * @param files - 업로드할 이미지 파일 배열
 * @param options - 업로드 옵션 (folder 등)
 * @returns 업로드 결과 (성공/실패 목록)
 */
export async function uploadMultipleImages(
  files: File[],
  options?: UploadOptions
): Promise<MultipleImageUploadResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  if (options?.folder) {
    formData.append("folder", options.folder);
  }

  // FormData 전송 시 Content-Type을 undefined로 설정하여 브라우저가 자동으로 boundary 포함하여 설정하도록 함
  const response = await apiClient.post<MultipleImageUploadResponse>(
    "/images/upload/multiple",
    formData,
    {
      headers: {
        "Content-Type": undefined,
      },
    }
  );

  return response.data;
}

/**
 * 이미지 삭제
 *
 * @param key - 이미지 키 (예: "products/seller_1/abc123.jpg")
 */
export async function deleteImage(key: string): Promise<DeleteResponse> {
  const response = await apiClient.delete<DeleteResponse>(`/images/${encodeURIComponent(key)}`);
  return response.data;
}

/**
 * 이미지 목록 조회
 *
 * @param page - 페이지 번호 (기본값: 1)
 * @param pageSize - 페이지당 항목 수 (기본값: 20)
 * @param folder - 폴더 필터 (선택)
 */
export async function listImages(
  page: number = 1,
  pageSize: number = 20,
  folder?: string
): Promise<ImageListResponse> {
  const response = await apiClient.get<ImageListResponse>("/images/", {
    params: { page, page_size: pageSize, folder },
  });
  return response.data;
}

// ============== Utility Functions ==============

/**
 * 파일 유효성 검사
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `허용되지 않는 파일 형식입니다. 허용: ${allowedTypes.join(", ")}`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. 최대 ${maxSize / (1024 * 1024)}MB까지 허용됩니다.`,
    };
  }

  return { valid: true };
}

/**
 * 파일 크기 포맷
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
