from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str
    email: str


class CreateAdminRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class RequestOtpRequest(BaseModel):
    purpose: str = Field(description="'email_change' | 'password_change' | 'phone_change'")
    new_value: Optional[str] = None  # new email or new phone, not needed for password_change


class VerifyOtpAndUpdateRequest(BaseModel):
    purpose: str
    otp: str
    new_value: Optional[str] = None  # new email, new phone, or new password depending on purpose


class RecoveryResetRequest(BaseModel):
    email: EmailStr
    recovery_code: str
    new_password: str
    new_email: Optional[EmailStr] = None
    new_phone: Optional[str] = None


# ---------- Leads ----------
class LeadCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: str
    service_interest: Optional[str] = None
    message: Optional[str] = None
    property_id: Optional[str] = None
    property_title: Optional[str] = None


class LeadUpdate(BaseModel):
    status: Optional[str] = None  # new, contacted, in_progress, closed
    notes: Optional[str] = None


# ---------- Services ----------
class ServiceFAQ(BaseModel):
    question: str
    answer: str


class ServiceBase(BaseModel):
    title: str
    slug: str
    short_description: str
    full_description: str
    icon: Optional[str] = None
    order: int = 0
    faqs: List[ServiceFAQ] = []


class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    icon: Optional[str] = None
    order: Optional[int] = None
    faqs: Optional[List[ServiceFAQ]] = None


# ---------- Service listings (items under a service, e.g. specific offerings) ----------
class ServiceItemBase(BaseModel):
    title: str
    description: str
    photos: List[str] = []
    link: Optional[str] = None


class ServiceItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    photos: Optional[List[str]] = None
    link: Optional[str] = None


# ---------- Testimonials ----------
class TestimonialBase(BaseModel):
    name: str
    role: Optional[str] = None  # e.g. "Homeowner, Vellore"
    quote: str
    rating: Optional[int] = None  # 1-5


# ---------- Analytics ----------
class PageViewCreate(BaseModel):
    path: str


# ---------- Properties ----------
class PropertyBase(BaseModel):
    title: str
    location: str
    price: Optional[str] = None
    property_type: Optional[str] = None  # apartment, plot, villa, commercial
    description: str
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area_sqft: Optional[float] = None
    images: List[str] = []
    status: str = "available"  # available, sold, coming_soon
    featured: bool = False


class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    price: Optional[str] = None
    property_type: Optional[str] = None
    description: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area_sqft: Optional[float] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None
    featured: Optional[bool] = None
