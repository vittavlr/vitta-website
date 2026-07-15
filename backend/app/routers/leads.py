from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.auth import require_admin, send_email
from app.database import leads_collection
from app.models import LeadCreate, LeadUpdate
from app.config import settings

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

    send_email(
        settings.SEED_OWNER_EMAIL,
        f"New VITTA inquiry from {payload.name}",
        f"Name: {payload.name}\nEmail: {payload.email}\nPhone: {payload.phone or '-'}\n"
        f"Interested in: {payload.service_interest or '-'}\n\nMessage:\n{payload.message}",
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
    return {"total_leads": total, "new_leads": new, "leads_this_month": this_month}


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
