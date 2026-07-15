import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "vitta")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "insecure-dev-secret")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))

    SEED_OWNER_EMAIL: str = os.getenv("SEED_OWNER_EMAIL", "owner@vittagroup.com")
    SEED_OWNER_PASSWORD: str = os.getenv("SEED_OWNER_PASSWORD", "ChangeMe123!")
    SEED_OWNER_NAME: str = os.getenv("SEED_OWNER_NAME", "VITTA Owner")

    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "VITTA")

    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

settings = Settings()
