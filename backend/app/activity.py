from datetime import datetime, timezone

from app.database import activity_log_collection


async def log_activity(user_email: str, action: str) -> None:
    """Best-effort activity log entry — never raises, so a logging failure
    can't break the actual request that triggered it."""
    try:
        await activity_log_collection.insert_one(
            {
                "user_email": user_email,
                "action": action,
                "created_at": datetime.now(timezone.utc),
            }
        )
    except Exception as e:
        print(f"Failed to log activity: {e}")
