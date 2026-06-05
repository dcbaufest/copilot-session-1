import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import router

app = FastAPI(
    title="JWT Authentication API",
    description="FastAPI application demonstrating JWT authentication with login and token refresh.",
    version="1.0.0",
)

_allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(router, tags=["auth"])


@app.get("/health", tags=["health"], summary="Health check")
def health_check() -> dict:
    return {"status": "ok"}
