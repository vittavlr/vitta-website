from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.auth import require_admin
from app.database import testimonials_collection
from app.models import TestimonialBase, TestimonialUpdate

router = APIRouter(prefix="/api/testimonials", tags=["testimonials"])


def serialize(t: dict) -> dict:
    t["id"] = str(t["_id"])
    del t["_id"]
    return t


@router.get("")
async def list_testimonials():
    """Public — powers the homepage testimonials section. Only approved ones."""
    cursor = testimonials_collection.find({"approved": True})
    return [serialize(t) async for t in cursor]


@router.get("/all")
async def list_all_testimonials(admin: dict = Depends(require_admin)):
    """Admin/Owner — every testimonial, approved or pending review."""
    cursor = testimonials_collection.find()
    return [serialize(t) async for t in cursor]


@router.post("/submit")
async def submit_testimonial(payload: TestimonialBase):
    """Public — customer-submitted review from the footer 'Leave a review'
    button. Goes in as unapproved until an Owner/Admin reviews it."""
    doc = payload.model_dump()
    doc["approved"] = False
    result = await testimonials_collection.insert_one(doc)
    return {"message": "Thank you — your review will appear once reviewed.", "id": str(result.inserted_id)}


@router.post("")
async def create_testimonial(payload: TestimonialBase, admin: dict = Depends(require_admin)):
    """Admin/Owner adding a testimonial directly — auto-approved."""
    doc = payload.model_dump()
    doc["approved"] = True
    result = await testimonials_collection.insert_one(doc)
    return {"message": "Testimonial added", "id": str(result.inserted_id)}


@router.put("/{testimonial_id}")
async def update_testimonial(testimonial_id: str, payload: TestimonialUpdate, admin: dict = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await testimonials_collection.update_one({"_id": ObjectId(testimonial_id)}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Testimonial updated"}


@router.delete("/{testimonial_id}")
async def delete_testimonial(testimonial_id: str, admin: dict = Depends(require_admin)):
    result = await testimonials_collection.delete_one({"_id": ObjectId(testimonial_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Testimonial deleted"}
