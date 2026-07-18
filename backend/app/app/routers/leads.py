import csv
import io
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.auth import require_admin, send_email
from app.config import settings
from app.database import leads_collection, users_collection
from app.models import LeadCreate, LeadUpdate

router = APIRouter(prefix="/api/leads", tags=["leads"])


def serialize_lead(l: dict) -> dict:
    l["id"] = str(l["_id"])
    del l["_id"]
    return l


@router.post("")
async def submit_lead(payload: LeadCreate):
    """Public endpoint — the viewer-facing 'Inquire' / Contact form."""
    doc = payload.model_dump()
    doc["status"] = "new"
    doc["notes"] = ""
    doc["created_at"] = datetime.now(timezone.utc)
    result = await leads_collection.insert_one(doc)

    owner = await users_collection.find_one({"role": "owner"})
    notify_email = owner["email"] if owner else settings.SEED_OWNER_EMAIL

    send_email(
        notify_email,
        f"New VITTA inquiry from {payload.name}",
        f"Name: {payload.name}\nEmail: {payload.email or '-'}\nPhone: {payload.phone}\n"
        f"Interested in: {payload.service_interest or '-'}\n\nMessage:\n{payload.message or '-'}",
    )

    return {"message": "Thank you — we'll be in touch shortly.", "id": str(result.inserted_id)}


@router.get("")
async def list_leads(admin: dict = Depends(require_admin)):
    cursor = leads_collection.find().sort("created_at", -1)
    return [serialize_lead(l) async for l in cursor]


@router.get("/stats")
async def lead_stats(admin: dict = Depends(require_admin)):
    total = await leads_collection.count_documents({})
    new = await leads_collection.count_documents({"status": "new"})
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    this_month = await leads_collection.count_documents({"created_at": {"$gte": month_start}})

    by_service = []
    cursor = leads_collection.aggregate(
        [
            {"$group": {"_id": {"$ifNull": ["$service_interest", "Not specified"]}, "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]
    )
    async for row in cursor:
        by_service.append({"service": row["_id"], "count": row["count"]})

    by_property = []
    cursor = leads_collection.aggregate(
        [
            {"$match": {"property_title": {"$ne": None}}},
            {"$group": {"_id": "$property_title", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]
    )
    async for row in cursor:
        by_property.append({"property": row["_id"], "count": row["count"]})

    return {
        "total_leads": total,
        "new_leads": new,
        "leads_this_month": this_month,
        "by_service": by_service,
        "by_property": by_property,
    }


@router.get("/export")
async def export_leads_csv(admin: dict = Depends(require_admin)):
    """Downloads all leads as a CSV file."""
    cursor = leads_collection.find().sort("created_at", -1)
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        ["Name", "Phone", "Email", "Service", "Property", "Message", "Status", "Notes", "Submitted At"]
    )
    async for l in cursor:
        writer.writerow(
            [
                l.get("name", ""),
                l.get("phone", ""),
                l.get("email") or "",
                l.get("service_interest") or "",
                l.get("property_title") or "",
                (l.get("message") or "").replace("\n", " "),
                l.get("status", ""),
                l.get("notes") or "",
                l.get("created_at").isoformat() if l.get("created_at") else "",
            ]
        )
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vitta-leads.csv"},
    )


@router.patch("/{lead_id}")
async def update_lead(lead_id: str, payload: LeadUpdate, admin: dict = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await leads_collection.update_one({"_id": ObjectId(lead_id)}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead updated"}


@router.delete("/{lead_id}")
async def delete_lead(lead_id: str, admin: dict = Depends(require_admin)):
    result = await leads_collection.delete_one({"_id": ObjectId(lead_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted"}
