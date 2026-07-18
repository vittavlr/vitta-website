from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.auth import require_admin
from app.database import page_views_collection
from app.models import PageViewCreate

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.post("/pageview")
async def track_pageview(payload: PageViewCreate):
    """Public, fire-and-forget — called once per page the visitor lands on."""
    await page_views_collection.insert_one(
        {"path": payload.path, "created_at": datetime.now(timezone.utc)}
    )
    return {"ok": True}


@router.get("/summary")
async def analytics_summary(admin: dict = Depends(require_admin)):
    total = await page_views_collection.count_documents({})
    by_path = []
    cursor = page_views_collection.aggregate(
        [
            {"$group": {"_id": "$path", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 12},
        ]
    )
    async for row in cursor:
        by_path.append({"path": row["_id"], "count": row["count"]})
    return {"total_views": total, "by_path": by_path}
