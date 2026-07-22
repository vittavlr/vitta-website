from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.DB_NAME]

users_collection = db["users"]
leads_collection = db["leads"]
services_collection = db["services"]
properties_collection = db["properties"]
otp_collection = db["otps"]
blog_collection = db["blog_posts"]
service_items_collection = db["service_items"]
testimonials_collection = db["testimonials"]
page_views_collection = db["page_views"]
activity_log_collection = db["activity_log"]
announcements_collection = db["announcements"]
