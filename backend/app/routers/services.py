from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.auth import require_admin
from app.database import services_collection
from app.models import ServiceBase, ServiceUpdate

router = APIRouter(prefix="/api/services", tags=["services"])


def serialize(s: dict) -> dict:
    s["id"] = str(s["_id"])
    del s["_id"]
    return s


@router.get("")
async def list_services():
    """Public — powers the Home & Services pages."""
    cursor = services_collection.find().sort("order", 1)
    return [serialize(s) async for s in cursor]


@router.get("/{slug}")
async def get_service(slug: str):
    s = await services_collection.find_one({"slug": slug})
    if not s:
        raise HTTPException(status_code=404, detail="Service not found")
    return serialize(s)


@router.post("")
async def create_service(payload: ServiceBase, admin: dict = Depends(require_admin)):
    existing = await services_collection.find_one({"slug": payload.slug})
    if existing:
        raise HTTPException(status_code=400, detail="A service with this slug already exists")
    result = await services_collection.insert_one(payload.model_dump())
    return {"message": "Service created", "id": str(result.inserted_id)}


@router.put("/{service_id}")
async def update_service(service_id: str, payload: ServiceUpdate, admin: dict = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await services_collection.update_one({"_id": ObjectId(service_id)}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service updated — public site reflects this instantly"}


@router.delete("/{service_id}")
async def delete_service(service_id: str, admin: dict = Depends(require_admin)):
    result = await services_collection.delete_one({"_id": ObjectId(service_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted"}
