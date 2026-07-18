from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.auth import require_admin
from app.database import testimonials_collection
from app.models import TestimonialBase

router = APIRouter(prefix="/api/testimonials", tags=["testimonials"])


def serialize(t: dict) -> dict:
    t["id"] = str(t["_id"])
    del t["_id"]
    return t


@router.get("")
async def list_testimonials():
    """Public — powers the homepage testimonials section."""
    cursor = testimonials_collection.find()
    return [serialize(t) async for t in cursor]


@router.post("")
async def create_testimonial(payload: TestimonialBase, admin: dict = Depends(require_admin)):
    result = await testimonials_collection.insert_one(payload.model_dump())
    return {"message": "Testimonial added", "id": str(result.inserted_id)}


@router.delete("/{testimonial_id}")
async def delete_testimonial(testimonial_id: str, admin: dict = Depends(require_admin)):
    result = await testimonials_collection.delete_one({"_id": ObjectId(testimonial_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Testimonial deleted"}
