from fastapi import FastAPI

from app.routes import router

app = FastAPI(
    title="JWT Authentication API",
    description="FastAPI application demonstrating JWT authentication with login and token refresh.",
    version="1.0.0",
)

app.include_router(router, tags=["auth"])


@app.get("/health", tags=["health"], summary="Health check")
def health_check() -> dict:
    return {"status": "ok"}
