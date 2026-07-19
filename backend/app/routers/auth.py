from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.auth import (
    create_access_token,
    generate_otp,
    get_current_user,
    hash_password,
    hash_recovery_code,
    require_owner,
    send_email,
    verify_password,
    verify_recovery_code,
)
from app.database import otp_collection, users_collection
from app.activity import log_activity
from app.models import (
    CreateAdminRequest,
    LoginRequest,
    RecoveryResetRequest,
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


@router.get("/public-contact")
async def public_contact():
    """Public — powers the footer's phone/email links, always reflecting the
    Owner's current details as changed via Settings."""
    owner = await users_collection.find_one({"role": "owner"})
    if not owner:
        return {"phone": None, "email": None}
    return {"phone": owner.get("phone"), "email": owner.get("email")}


@router.post("/recovery-reset")
async def recovery_reset(payload: RecoveryResetRequest):
    """Reset password (and optionally email/phone) using the account's recovery
    code — for use when the account's email is inaccessible, bypassing OTP."""
    user = await users_collection.find_one({"email": payload.email.lower()})
    if not user or not user.get("recovery_code_hash"):
        raise HTTPException(status_code=400, detail="Recovery is not available for this account")

    if not verify_recovery_code(payload.recovery_code, user["recovery_code_hash"]):
        raise HTTPException(status_code=400, detail="Invalid recovery code")

    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    update = {"password_hash": hash_password(payload.new_password)}

    if payload.new_email:
        existing = await users_collection.find_one({"email": payload.new_email.lower()})
        if existing and existing["_id"] != user["_id"]:
            raise HTTPException(status_code=400, detail="Email already in use")
        update["email"] = payload.new_email.lower()

    if payload.new_phone:
        update["phone"] = payload.new_phone

    await users_collection.update_one({"_id": user["_id"]}, {"$set": update})
    return {"message": "Account recovered — you can now log in with your new password"}


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
    await log_activity(owner["email"], f"Created admin account for {payload.email.lower()}")
    return {"message": "Admin account created"}


@router.get("/activity")
async def get_activity_log(owner: dict = Depends(require_owner)):
    """Owner-only: recent admin/owner actions across the site."""
    from app.database import activity_log_collection

    cursor = activity_log_collection.find().sort("created_at", -1).limit(100)
    entries = []
    async for a in cursor:
        entries.append(
            {
                "id": str(a["_id"]),
                "user_email": a["user_email"],
                "action": a["action"],
                "created_at": a["created_at"].isoformat() if a.get("created_at") else None,
            }
        )
    return entries


@router.delete("/activity/{entry_id}")
async def delete_activity_entry(entry_id: str, owner: dict = Depends(require_owner)):
    """Owner-only — deleting activity entries is restricted to the single
    Owner account by the require_owner dependency; no admin account can ever
    hold the 'owner' role, so this can't be reached by any other admin."""
    from app.database import activity_log_collection

    result = await activity_log_collection.delete_one({"_id": ObjectId(entry_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Activity entry not found")
    return {"message": "Activity entry deleted"}


@router.delete("/activity")
async def clear_activity_log(owner: dict = Depends(require_owner)):
    """Owner-only — clears the entire activity log."""
    from app.database import activity_log_collection

    result = await activity_log_collection.delete_many({})
    return {"message": f"Cleared {result.deleted_count} activity entries"}


@router.get("/admins")
async def list_admins(owner: dict = Depends(require_owner)):
    cursor = users_collection.find({"role": "admin"})
    admins = []
    async for a in cursor:
        admins.append({"id": str(a["_id"]), "name": a["name"], "email": a["email"]})
    return admins


@router.delete("/admins/{admin_id}")
async def delete_admin(admin_id: str, owner: dict = Depends(require_owner)):
    admin_user = await users_collection.find_one({"_id": ObjectId(admin_id), "role": "admin"})
    result = await users_collection.delete_one({"_id": ObjectId(admin_id), "role": "admin"})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found")
    await log_activity(
        owner["email"], f"Removed admin account {admin_user['email'] if admin_user else admin_id}"
    )
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
