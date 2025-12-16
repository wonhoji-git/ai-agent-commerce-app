"""
FastAPI Main Application

AI Agent Commerce App Backend
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routers import images_router

# FastAPI 앱 생성
app = FastAPI(
    title="AI Agent Commerce API",
    description="AI 에이전트 기반 커머스 애플리케이션 백엔드 API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS 설정
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 라우터 등록
app.include_router(images_router, prefix="/api/v1")


# Health check
@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {"status": "healthy", "version": "0.1.0"}


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "AI Agent Commerce API",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        reload=True
    )
