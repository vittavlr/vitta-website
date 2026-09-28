from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.auth import require_owner
from app.database import businesses_collection
from app.models import BusinessBase, BusinessUpdate
from app.activity import log_activity

router = APIRouter(prefix="/api/businesses", tags=["businesses"])


def serialize(b: dict) -> dict:
    b["id"] = str(b["_id"])
    del b["_id"]
    return b


@router.get("")
async def list_businesses():
    """Public — powers the top business switcher bar. VITTA (the site
    itself) is not stored here; this lists the OTHER linked businesses."""
    cursor = businesses_collection.find().sort("order", 1)
    return [serialize(b) async for b in cursor]


@router.get("/primary")
async def get_primary_business():
    """Public — whichever business (if any) is currently set as primary,
    used to override the site's displayed name/logo. Returns null if VITTA
    itself is primary (the default)."""
    b = await businesses_collection.find_one({"is_primary": True})
    return serialize(b) if b else None


@router.post("")
async def create_business(payload: BusinessBase, owner: dict = Depends(require_owner)):
    doc = payload.model_dump()
    doc["is_primary"] = False
    result = await businesses_collection.insert_one(doc)
    await log_activity(owner["email"], f"Added business '{payload.name}'")
    return {"message": "Business added", "id": str(result.inserted_id)}


@router.put("/{business_id}")
async def update_business(business_id: str, payload: BusinessUpdate, owner: dict = Depends(require_owner)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await businesses_collection.update_one({"_id": ObjectId(business_id)}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Business not found")
    return {"message": "Business updated"}


@router.post("/{business_id}/set-primary")
async def set_primary_business(business_id: str, owner: dict = Depends(require_owner)):
    """Owner-only — marks one business as primary (site displays its name/
    logo instead of VITTA's) and clears the flag on every other one,
    including allowing 'unset' by passing business_id='vitta'."""
    await businesses_collection.update_many({}, {"$set": {"is_primary": False}})
    if business_id != "vitta":
        result = await businesses_collection.update_one(
            {"_id": ObjectId(business_id)}, {"$set": {"is_primary": True}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Business not found")
    await log_activity(owner["email"], f"Set primary business to {business_id}")
    return {"message": "Primary business updated"}


@router.delete("/{business_id}")
async def delete_business(business_id: str, owner: dict = Depends(require_owner)):
    result = await businesses_collection.delete_one({"_id": ObjectId(business_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Business not found")
    return {"message": "Business deleted"}
