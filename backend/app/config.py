import os

SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production-super-secret-key-32chars!")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS: int = 300
