from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from jose import JWTError

from app.auth import authenticate_user, create_access_token, decode_token
from app.config import ACCESS_TOKEN_EXPIRE_SECONDS
from app.models import Token, UserLogin

router = APIRouter()
bearer_scheme = HTTPBearer()


@router.post("/token", response_model=Token, summary="Login and obtain a JWT")
def login(credentials: UserLogin) -> Token:
    """
    Authenticate with username and password.
    Returns a JWT access token valid for 300 seconds.
    """
    username = authenticate_user(credentials.username, credentials.password)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": username})
    return Token(access_token=token, token_type="bearer", expires_in=ACCESS_TOKEN_EXPIRE_SECONDS)


@router.post("/token/refresh", response_model=Token, summary="Refresh an existing JWT")
def refresh_token(
    http_credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Token:
    """
    Provide a valid (non-expired) JWT in the Authorization header
    to receive a new token with a fresh 300-second expiration.
    """
    token = http_credentials.credentials
    try:
        username = decode_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    new_token = create_access_token({"sub": username})
    return Token(access_token=new_token, token_type="bearer", expires_in=ACCESS_TOKEN_EXPIRE_SECONDS)
