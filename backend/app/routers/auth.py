from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.auth import (
    create_access_token,
    generate_otp,
    get_current_user,
    hash_password,
    require_owner,
    send_email,
    verify_password,
)
from app.database import otp_collection, users_collection
from app.models import (
    CreateAdminRequest,
    LoginRequest,
    RequestOtpRequest,
    TokenResponse,
    VerifyOtpAndUpdateRequest,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

OTP_EXPIRE_MINUTES = 10


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = await users_collection.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user["email"]})
    return TokenResponse(
        access_token=token,
        role=user["role"],
        name=user["name"],
        email=user["email"],
    )


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return {
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "phone": user.get("phone"),
    }


@router.post("/create-admin")
async def create_admin(payload: CreateAdminRequest, owner: dict = Depends(require_owner)):
    """Owner-only: create a new Admin account for an employee."""
    existing = await users_collection.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists")

    await users_collection.insert_one(
        {
            "name": payload.name,
            "email": payload.email.lower(),
            "password_hash": hash_password(payload.password),
            "role": "admin",
            "phone": None,
            "created_at": datetime.now(timezone.utc),
        }
    )
    return {"message": "Admin account created"}


@router.get("/admins")
async def list_admins(owner: dict = Depends(require_owner)):
    cursor = users_collection.find({"role": "admin"})
    admins = []
    async for a in cursor:
        admins.append({"id": str(a["_id"]), "name": a["name"], "email": a["email"]})
    return admins


@router.delete("/admins/{admin_id}")
async def delete_admin(admin_id: str, owner: dict = Depends(require_owner)):
    result = await users_collection.delete_one({"_id": ObjectId(admin_id), "role": "admin"})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found")
    return {"message": "Admin removed"}


# ---------- OTP-verified credential change ----------
# Supports: purpose = "password_change" | "email_change" | "phone_change"
# Flow: 1) request-otp -> sends a 6-digit code to the account's CURRENT email
#       2) verify-otp -> user submits the code + the new value to apply the change


@router.post("/request-otp")
async def request_otp(payload: RequestOtpRequest, user: dict = Depends(get_current_user)):
    if payload.purpose not in ("password_change", "email_change", "phone_change"):
        raise HTTPException(status_code=400, detail="Invalid purpose")

    if payload.purpose in ("email_change", "phone_change") and not payload.new_value:
        raise HTTPException(status_code=400, detail="new_value is required")

    code = generate_otp()
    await otp_collection.insert_one(
        {
            "user_email": user["email"],
            "purpose": payload.purpose,
            "code": code,
            "new_value": payload.new_value,
            "expires_at": datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES),
            "used": False,
        }
    )

    sent = send_email(
        user["email"],
        "Your VITTA verification code",
        f"Your verification code is {code}. It expires in {OTP_EXPIRE_MINUTES} minutes. "
        f"If you did not request this, please ignore this email.",
    )

    response = {"message": f"Verification code sent to {user['email']}"}
    if not sent:
        # SMTP not configured — surface the code so the flow is still usable in dev
        response["dev_otp"] = code
        response["message"] = "SMTP not configured — showing code for development only"
    return response


@router.post("/verify-otp")
async def verify_otp(payload: VerifyOtpAndUpdateRequest, user: dict = Depends(get_current_user)):
    record = await otp_collection.find_one(
        {
            "user_email": user["email"],
            "purpose": payload.purpose,
            "code": payload.otp,
            "used": False,
        },
        sort=[("_id", -1)],
    )
    if not record:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    expires_at = record["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Verification code expired")

    await otp_collection.update_one({"_id": record["_id"]}, {"$set": {"used": True}})

    if payload.purpose == "password_change":
        if not payload.new_value or len(payload.new_value) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
        await users_collection.update_one(
            {"email": user["email"]}, {"$set": {"password_hash": hash_password(payload.new_value)}}
        )
        return {"message": "Password updated"}

    if payload.purpose == "email_change":
        new_email = (record.get("new_value") or "").lower()
        existing = await users_collection.find_one({"email": new_email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        await users_collection.update_one({"email": user["email"]}, {"$set": {"email": new_email}})
        return {"message": "Email updated", "new_email": new_email}

    if payload.purpose == "phone_change":
        await users_collection.update_one(
            {"email": user["email"]}, {"$set": {"phone": record.get("new_value")}}
        )
        return {"message": "Phone updated"}

    raise HTTPException(status_code=400, detail="Unhandled purpose")
