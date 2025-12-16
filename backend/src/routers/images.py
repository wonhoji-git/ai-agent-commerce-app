"""
이미지 업로드 API 라우터

엔드포인트:
- POST /api/v1/images/upload          : 단일 이미지 업로드
- POST /api/v1/images/upload/multiple : 다중 이미지 업로드 (최대 10개)
- DELETE /api/v1/images/{key}         : 이미지 삭제
- GET /api/v1/images/                 : 이미지 목록 조회
"""

import os
import uuid
import shutil
from datetime import datetime
from typing import Optional
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# 라우터 생성
router = APIRouter(prefix="/images", tags=["images"])

# 설정
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads/images"))
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_MULTIPLE_FILES = 10

# 업로드 디렉토리 생성
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ============== Response Models ==============

class ImageUploadResponse(BaseModel):
    """단일 이미지 업로드 응답"""
    success: bool
    key: str
    filename: str
    url: str
    size: int
    content_type: str
    uploaded_at: str


class MultipleImageUploadResponse(BaseModel):
    """다중 이미지 업로드 응답"""
    success: bool
    uploaded: list[ImageUploadResponse]
    failed: list[dict]
    total_uploaded: int
    total_failed: int


class ImageInfo(BaseModel):
    """이미지 정보"""
    key: str
    filename: str
    url: str
    size: int
    uploaded_at: str


class ImageListResponse(BaseModel):
    """이미지 목록 응답"""
    success: bool
    images: list[ImageInfo]
    total: int
    page: int
    page_size: int


class DeleteResponse(BaseModel):
    """삭제 응답"""
    success: bool
    message: str
    key: str


# ============== Helper Functions ==============

def generate_image_key() -> str:
    """고유 이미지 키 생성"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = uuid.uuid4().hex[:8]
    return f"{timestamp}_{unique_id}"


def validate_file(file: UploadFile) -> tuple[bool, str]:
    """파일 유효성 검사"""
    # 파일 확장자 검사
    if file.filename:
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            return False, f"허용되지 않는 파일 형식입니다. 허용: {', '.join(ALLOWED_EXTENSIONS)}"

    # Content-Type 검사
    if file.content_type and not file.content_type.startswith("image/"):
        return False, "이미지 파일만 업로드할 수 있습니다."

    return True, ""


def get_image_url(key: str, filename: str) -> str:
    """이미지 URL 생성"""
    base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
    return f"{base_url}/api/v1/images/file/{key}/{filename}"


async def save_upload_file(file: UploadFile, key: str) -> tuple[str, int]:
    """파일 저장"""
    # 파일 경로 생성
    ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    safe_filename = f"{key}{ext}"
    file_path = UPLOAD_DIR / safe_filename

    # 파일 저장
    total_size = 0
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):  # 1MB chunks
            total_size += len(chunk)
            if total_size > MAX_FILE_SIZE:
                # 크기 초과 시 파일 삭제
                file_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=413,
                    detail=f"파일 크기가 너무 큽니다. 최대 {MAX_FILE_SIZE // (1024*1024)}MB까지 허용됩니다."
                )
            buffer.write(chunk)

    return safe_filename, total_size


# ============== API Endpoints ==============

@router.post("/upload", response_model=ImageUploadResponse)
async def upload_single_image(
    file: UploadFile = File(..., description="업로드할 이미지 파일")
):
    """
    단일 이미지 업로드

    - 지원 형식: jpg, jpeg, png, gif, webp, svg
    - 최대 크기: 10MB
    """
    # 유효성 검사
    is_valid, error_message = validate_file(file)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)

    # 파일 저장
    key = generate_image_key()
    try:
        saved_filename, file_size = await save_upload_file(file, key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 저장 중 오류가 발생했습니다: {str(e)}")

    # 응답 생성
    return ImageUploadResponse(
        success=True,
        key=key,
        filename=saved_filename,
        url=get_image_url(key, saved_filename),
        size=file_size,
        content_type=file.content_type or "image/jpeg",
        uploaded_at=datetime.now().isoformat()
    )


@router.post("/upload/multiple", response_model=MultipleImageUploadResponse)
async def upload_multiple_images(
    files: list[UploadFile] = File(..., description="업로드할 이미지 파일들 (최대 10개)")
):
    """
    다중 이미지 업로드 (최대 10개)

    - 지원 형식: jpg, jpeg, png, gif, webp, svg
    - 최대 크기: 각 파일당 10MB
    - 최대 개수: 10개
    """
    if len(files) > MAX_MULTIPLE_FILES:
        raise HTTPException(
            status_code=400,
            detail=f"한 번에 최대 {MAX_MULTIPLE_FILES}개의 파일만 업로드할 수 있습니다."
        )

    uploaded = []
    failed = []

    for file in files:
        # 유효성 검사
        is_valid, error_message = validate_file(file)
        if not is_valid:
            failed.append({
                "filename": file.filename,
                "error": error_message
            })
            continue

        # 파일 저장
        key = generate_image_key()
        try:
            saved_filename, file_size = await save_upload_file(file, key)
            uploaded.append(ImageUploadResponse(
                success=True,
                key=key,
                filename=saved_filename,
                url=get_image_url(key, saved_filename),
                size=file_size,
                content_type=file.content_type or "image/jpeg",
                uploaded_at=datetime.now().isoformat()
            ))
        except HTTPException as e:
            failed.append({
                "filename": file.filename,
                "error": e.detail
            })
        except Exception as e:
            failed.append({
                "filename": file.filename,
                "error": str(e)
            })

    return MultipleImageUploadResponse(
        success=len(uploaded) > 0,
        uploaded=uploaded,
        failed=failed,
        total_uploaded=len(uploaded),
        total_failed=len(failed)
    )


@router.delete("/{key}", response_model=DeleteResponse)
async def delete_image(key: str):
    """
    이미지 삭제

    - key: 이미지 업로드 시 반환된 고유 키
    """
    # 해당 키로 시작하는 파일 찾기
    matching_files = list(UPLOAD_DIR.glob(f"{key}.*"))

    if not matching_files:
        raise HTTPException(status_code=404, detail="이미지를 찾을 수 없습니다.")

    # 파일 삭제
    for file_path in matching_files:
        try:
            file_path.unlink()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"파일 삭제 중 오류가 발생했습니다: {str(e)}")

    return DeleteResponse(
        success=True,
        message="이미지가 성공적으로 삭제되었습니다.",
        key=key
    )


@router.get("/", response_model=ImageListResponse)
async def list_images(
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지당 항목 수")
):
    """
    이미지 목록 조회

    - page: 페이지 번호 (기본값: 1)
    - page_size: 페이지당 항목 수 (기본값: 20, 최대: 100)
    """
    # 모든 이미지 파일 가져오기
    all_files = sorted(
        UPLOAD_DIR.glob("*"),
        key=lambda f: f.stat().st_mtime,
        reverse=True
    )

    # 디렉토리 제외
    all_files = [f for f in all_files if f.is_file()]

    total = len(all_files)

    # 페이지네이션
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_files = all_files[start_idx:end_idx]

    # 이미지 정보 생성
    images = []
    for file_path in page_files:
        key = file_path.stem  # 확장자 제외한 파일명
        stat = file_path.stat()
        images.append(ImageInfo(
            key=key,
            filename=file_path.name,
            url=get_image_url(key, file_path.name),
            size=stat.st_size,
            uploaded_at=datetime.fromtimestamp(stat.st_mtime).isoformat()
        ))

    return ImageListResponse(
        success=True,
        images=images,
        total=total,
        page=page,
        page_size=page_size
    )


# ============== Static File Serving ==============

from fastapi.responses import FileResponse

@router.get("/file/{key}/{filename}")
async def serve_image(key: str, filename: str):
    """
    이미지 파일 제공

    - key: 이미지 키
    - filename: 파일명
    """
    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="이미지를 찾을 수 없습니다.")

    # 보안: 경로 탐색 공격 방지
    if not file_path.resolve().is_relative_to(UPLOAD_DIR.resolve()):
        raise HTTPException(status_code=403, detail="접근이 거부되었습니다.")

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=f"image/{file_path.suffix[1:]}"  # .jpg -> image/jpg
    )
