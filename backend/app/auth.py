import random
import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.text import MIMEText

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings
from app.database import users_collection
import requests

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user


async def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") not in ("admin", "owner"):
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user


async def require_owner(user: dict = Depends(get_current_user)):
    if user.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Owner privileges required")
    return user


def hash_recovery_code(code: str) -> str:
    return pwd_context.hash(code)


def verify_recovery_code(code: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(code, hashed)
    except Exception:
        return False


def generate_otp() -> str:
    return f"{random.randint(0, 999999):06d}"


def send_email(to_email: str, subject: str, body: str) -> bool:
    if not settings.BREVO_API_KEY or not settings.BREVO_SENDER_EMAIL:
        print(f"[DEV MODE - EMAIL NOT CONFIGURED] Would send to {to_email}: {subject}\n{body}")
        return False
    try:
        response = requests.post(
            "https://api.brevo.com/v3/smtp/email",
            headers={
                "accept": "application/json",
                "api-key": settings.BREVO_API_KEY,
                "content-type": "application/json",
            },
            json={
                "sender": {"name": settings.SMTP_FROM_NAME, "email": settings.BREVO_SENDER_EMAIL},
                "to": [{"email": to_email}],
                "subject": subject,
                "textContent": body,
            },
            timeout=10,
        )
        if response.status_code >= 400:
            print(f"Brevo send failed: {response.status_code} {response.text}")
            return False
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
