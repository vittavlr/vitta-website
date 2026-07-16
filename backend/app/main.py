from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import hash_password, hash_recovery_code
from app.config import settings
from app.database import services_collection, users_collection
from app.routers import auth, leads, properties, services

app = FastAPI(title="VITTA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(services.router)
app.include_router(properties.router)

DEFAULT_SERVICES = [
    {
        "title": "Real Estate",
        "slug": "real-estate",
        "short_description": "End-to-end guidance for buying, selling, and investing in property.",
        "full_description": "Our real estate advisory covers site selection, valuation, legal "
        "due-diligence, negotiation, and documentation — so every decision is grounded in verified facts.",
        "icon": "building",
        "order": 1,
    },
    {
        "title": "Finance",
        "slug": "finance",
        "short_description": "Loans, structuring, and financial planning tailored to your goals.",
        "full_description": "From home loans to business financing, we help structure the right mix "
        "of debt and capital, and negotiate with lenders on your behalf.",
        "icon": "coins",
        "order": 2,
    },
    {
        "title": "Insurance",
        "slug": "insurance",
        "short_description": "Life, health, and asset protection plans that actually fit your life.",
        "full_description": "We review your risk profile and match you with insurance products that "
        "provide real protection without unnecessary premiums.",
        "icon": "shield",
        "order": 3,
    },
    {
        "title": "Mutual Funds",
        "slug": "mutual-funds",
        "short_description": "Long-term wealth building through disciplined, diversified investing.",
        "full_description": "Our mutual fund advisory focuses on goal-based investing — retirement, "
        "education, or wealth creation — with periodic portfolio reviews.",
        "icon": "chart",
        "order": 4,
    },
    {
        "title": "Legal Counsel",
        "slug": "legal-counsel",
        "short_description": "Contracts, property law, and compliance handled with clarity.",
        "full_description": "Our legal partners assist with title verification, agreements, dispute "
        "resolution, and regulatory compliance for individuals and businesses.",
        "icon": "scale",
        "order": 5,
    },
    {
        "title": "College Admissions",
        "slug": "college-admissions",
        "short_description": "Guidance for students and families navigating higher education.",
        "full_description": "We help families evaluate institutions, prepare applications, and plan "
        "finances for domestic and international college admissions.",
        "icon": "graduation",
        "order": 6,
    },
]


@app.on_event("startup")
async def seed_data():
    owner = await users_collection.find_one({"role": "owner"})
    if not owner:
        await users_collection.insert_one(
            {
                "name": settings.SEED_OWNER_NAME,
                "email": settings.SEED_OWNER_EMAIL.lower(),
                "password_hash": hash_password(settings.SEED_OWNER_PASSWORD),
                "role": "owner",
                "phone": settings.SEED_OWNER_PHONE or None,
                "recovery_code_hash": hash_recovery_code(settings.SEED_OWNER_RECOVERY_CODE)
                if settings.SEED_OWNER_RECOVERY_CODE
                else None,
                "created_at": datetime.now(timezone.utc),
            }
        )
        print(f"Seeded owner account: {settings.SEED_OWNER_EMAIL}")

    count = await services_collection.count_documents({})
    if count == 0:
        await services_collection.insert_many(DEFAULT_SERVICES)
        print("Seeded default services")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
