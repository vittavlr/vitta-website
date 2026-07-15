from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.auth import require_admin
from app.database import properties_collection
from app.models import PropertyBase, PropertyUpdate

router = APIRouter(prefix="/api/properties", tags=["properties"])


def serialize(p: dict) -> dict:
    p["id"] = str(p["_id"])
    del p["_id"]
    return p


@router.get("")
async def list_properties():
    """Public — Listings page. Returns [] until the admin adds properties."""
    cursor = properties_collection.find().sort("featured", -1)
    return [serialize(p) async for p in cursor]


@router.get("/{property_id}")
async def get_property(property_id: str):
    p = await properties_collection.find_one({"_id": ObjectId(property_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Property not found")
    return serialize(p)


@router.post("")
async def create_property(payload: PropertyBase, admin: dict = Depends(require_admin)):
    result = await properties_collection.insert_one(payload.model_dump())
    return {"message": "Property added", "id": str(result.inserted_id)}


@router.put("/{property_id}")
async def update_property(property_id: str, payload: PropertyUpdate, admin: dict = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await properties_collection.update_one({"_id": ObjectId(property_id)}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": "Property updated"}


@router.delete("/{property_id}")
async def delete_property(property_id: str, admin: dict = Depends(require_admin)):
    result = await properties_collection.delete_one({"_id": ObjectId(property_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": "Property deleted"}
