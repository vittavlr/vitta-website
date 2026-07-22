from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.auth import require_admin
from app.database import service_items_collection, services_collection
from app.models import ServiceBase, ServiceItemBase, ServiceItemUpdate, ServiceUpdate
from app.activity import log_activity
from app.routers.announcements import post_announcement

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
    await log_activity(admin["email"], f"Created service '{payload.title}'")
    await post_announcement("New Service", f"We've added a new service: {payload.title}.", f"/services/{payload.slug}")
    return {"message": "Service created", "id": str(result.inserted_id)}


@router.put("/{service_id}")
async def update_service(service_id: str, payload: ServiceUpdate, admin: dict = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await services_collection.update_one({"_id": ObjectId(service_id)}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    await log_activity(admin["email"], f"Updated service (id {service_id})")
    return {"message": "Service updated — public site reflects this instantly"}


@router.delete("/{service_id}")
async def delete_service(service_id: str, admin: dict = Depends(require_admin)):
    service = await services_collection.find_one({"_id": ObjectId(service_id)})
    result = await services_collection.delete_one({"_id": ObjectId(service_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    removed_items = 0
    if service:
        del_items = await service_items_collection.delete_many({"service_slug": service["slug"]})
        removed_items = del_items.deleted_count
    await log_activity(
        admin["email"],
        f"Deleted service '{service['title'] if service else service_id}'"
        + (f" and {removed_items} listing(s) under it" if removed_items else ""),
    )
    return {"message": "Service deleted", "listings_removed": removed_items}


# ---------- Service listings (specific offerings under a service) ----------
# e.g. under "Real Estate" -> individual project listings; under "Finance" -> loan products.

def serialize_item(i: dict) -> dict:
    i["id"] = str(i["_id"])
    del i["_id"]
    return i


@router.get("/{slug}/items")
async def list_service_items(slug: str):
    """Public — powers the listings shown on each service's detail page."""
    cursor = service_items_collection.find({"service_slug": slug})
    return [serialize_item(i) async for i in cursor]


@router.post("/{slug}/items")
async def create_service_item(slug: str, payload: ServiceItemBase, admin: dict = Depends(require_admin)):
    service = await services_collection.find_one({"slug": slug})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    doc = payload.model_dump()
    doc["service_slug"] = slug
    result = await service_items_collection.insert_one(doc)
    return {"message": "Listing added", "id": str(result.inserted_id)}


@router.put("/items/{item_id}")
async def update_service_item(item_id: str, payload: ServiceItemUpdate, admin: dict = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await service_items_collection.update_one({"_id": ObjectId(item_id)}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"message": "Listing updated"}


@router.delete("/items/{item_id}")
async def delete_service_item(item_id: str, admin: dict = Depends(require_admin)):
    result = await service_items_collection.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"message": "Listing deleted"}
