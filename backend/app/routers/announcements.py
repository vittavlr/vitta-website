from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.auth import require_admin
from app.database import announcements_collection
from app.models import AnnouncementBase

router = APIRouter(prefix="/api/announcements", tags=["announcements"])


def serialize(a: dict) -> dict:
    a["id"] = str(a["_id"])
    del a["_id"]
    a["created_at"] = a["created_at"].isoformat() if a.get("created_at") else None
    return a


async def post_announcement(title: str, message: str, link: str | None = None) -> None:
    """Internal helper — called automatically when a service/property is
    added, and also usable for manual admin posts."""
    await announcements_collection.insert_one(
        {"title": title, "message": message, "link": link, "created_at": datetime.now(timezone.utc)}
    )


@router.get("")
async def list_announcements():
    """Public — powers the homepage Announcements section, most recent first."""
    cursor = announcements_collection.find().sort("created_at", -1).limit(20)
    return [serialize(a) async for a in cursor]


@router.post("")
async def create_announcement(payload: AnnouncementBase, admin: dict = Depends(require_admin)):
    await post_announcement(payload.title, payload.message, payload.link)
    return {"message": "Announcement posted"}


@router.delete("/{announcement_id}")
async def delete_announcement(announcement_id: str, admin: dict = Depends(require_admin)):
    result = await announcements_collection.delete_one({"_id": ObjectId(announcement_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement deleted"}
