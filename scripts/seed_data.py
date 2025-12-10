import asyncio
import sys
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import uuid
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path('/app/backend')
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_database():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Clear existing data
    print("Clearing existing data...")
    await db.users.delete_many({})
    await db.costumes.delete_many({})
    await db.bookings.delete_many({})
    
    # Create admin user
    print("Creating admin user...")
    admin_user = {
        "email": "admin@theatrical.com",
        "password": pwd_context.hash("admin123"),
        "name": "Admin User",
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_user)
    
    # Create regular user
    print("Creating test user...")
    test_user = {
        "email": "user@test.com",
        "password": pwd_context.hash("user123"),
        "name": "Test User",
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(test_user)
    
    # Create sample costumes
    print("Creating sample costumes...")
    costumes = [
        {
            "id": str(uuid.uuid4()),
            "name": "Victorian Era Gown",
            "description": "Elegant Victorian-era gown with intricate lace details and corset bodice. Perfect for period dramas and historical performances.",
            "category": "Period",
            "sizes": ["S", "M", "L"],
            "images": ["https://images.unsplash.com/photo-1660862903579-d48ab8cf7803?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHx2aW50YWdlJTIwdmljdG9yaWFuJTIwZHJlc3MlMjBtYW5uZXF1aW58ZW58MHx8fHwxNzY1MzMyMTkwfDA&ixlib=rb-4.1.0&q=85"],
            "price_per_day": 150.00,
            "available": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Ballet Tutu - Swan Lake",
            "description": "Professional ballet tutu with layered tulle and embellished bodice. Ideal for classical ballet performances.",
            "category": "Classical",
            "sizes": ["XS", "S", "M"],
            "images": ["https://images.unsplash.com/photo-1745282794652-b30c49cf35b8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxiYWxsZXQlMjB0dXR1JTIwc3BvdGxpZ2h0fGVufDB8fHx8MTc2NTMzMjE5M3ww&ixlib=rb-4.1.0&q=85"],
            "price_per_day": 120.00,
            "available": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Renaissance Nobleman Attire",
            "description": "Luxurious Renaissance costume with velvet doublet, breeches, and cape. Authentic details for historical accuracy.",
            "category": "Period",
            "sizes": ["M", "L", "XL"],
            "images": ["https://images.unsplash.com/photo-1715019450175-ce526f39f133?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHx0aGVhdHJpY2FsJTIwY29zdHVtZXMlMjBkcmFtYXRpYyUyMGxpZ2h0aW5nfGVufDB8fHx8MTc2NTMzMjE4OXww&ixlib=rb-4.1.0&q=85"],
            "price_per_day": 180.00,
            "available": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Modern Dramatic Ensemble",
            "description": "Contemporary theatrical costume with dramatic silhouette. Perfect for modern performances and avant-garde productions.",
            "category": "Modern",
            "sizes": ["S", "M", "L"],
            "images": ["https://images.unsplash.com/photo-1647187835067-a58451e3edf6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxiYWxsZXQlMjB0dXR1JTIwc3BvdGxpZ2h0fGVufDB8fHx8MTc2NTMzMjE5M3ww&ixlib=rb-4.1.0&q=85"],
            "price_per_day": 100.00,
            "available": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Shakespearean Hamlet Costume",
            "description": "Classic Shakespearean costume inspired by Hamlet productions. Includes tunic, cape, and period-appropriate accessories.",
            "category": "Classical",
            "sizes": ["M", "L"],
            "images": ["https://images.unsplash.com/photo-1707547707885-f8e23fc58192?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHx0aGVhdHJpY2FsJTIwY29zdHVtZXMlMjBkcmFtYXRpYyUyMGxpZ2h0aW5nfGVufDB8fHx8MTc2NTMzMjE4OXww&ixlib=rb-4.1.0&q=85"],
            "price_per_day": 140.00,
            "available": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fantasy Enchanted Forest",
            "description": "Ethereal fantasy costume with flowing fabrics and mystical elements. Ideal for fairy tale and fantasy productions.",
            "category": "Fantasy",
            "sizes": ["S", "M", "L"],
            "images": ["https://images.unsplash.com/photo-1660862903579-d48ab8cf7803?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHx2aW50YWdlJTIwdmljdG9yaWFuJTIwZHJlc3MlMjBtYW5uZXF1aW58ZW58MHx8fHwxNzY1MzMyMTkwfDA&ixlib=rb-4.1.0&q=85"],
            "price_per_day": 110.00,
            "available": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.costumes.insert_many(costumes)
    
    print("\n✓ Database seeded successfully!")
    print("\nAdmin credentials:")
    print("  Email: admin@theatrical.com")
    print("  Password: admin123")
    print("\nTest user credentials:")
    print("  Email: user@test.com")
    print("  Password: user123")
    print(f"\n{len(costumes)} costumes created")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
