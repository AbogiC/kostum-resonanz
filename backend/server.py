from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: EmailStr
    name: str
    role: str = "user"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class CostumeCreate(BaseModel):
    name: str
    description: str
    category: str
    sizes: List[str]
    images: List[str]
    price_per_day: float
    available: bool = True

class Costume(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    category: str
    sizes: List[str]
    images: List[str]
    price_per_day: float
    available: bool
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookingCreate(BaseModel):
    costume_id: str
    start_date: str
    end_date: str
    size: str
    notes: Optional[str] = None

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_email: str
    user_name: str
    costume_id: str
    costume_name: str
    start_date: str
    end_date: str
    size: str
    notes: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookingStatusUpdate(BaseModel):
    status: str

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"email": email}, {"_id": 0, "password": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Auth Routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user_doc = {
        "email": user_data.email,
        "password": hashed_password,
        "name": user_data.name,
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user_data.email})
    user = User(email=user_data.email, name=user_data.name, role="user")
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": credentials.email})
    user_data = User(email=user["email"], name=user["name"], role=user["role"])
    
    return Token(access_token=access_token, token_type="bearer", user=user_data)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return User(**current_user)

# Costume Routes
@api_router.get("/costumes", response_model=List[Costume])
async def get_costumes(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    costumes = await db.costumes.find(query, {"_id": 0}).to_list(1000)
    for costume in costumes:
        if isinstance(costume.get('created_at'), str):
            costume['created_at'] = datetime.fromisoformat(costume['created_at'])
    return costumes

@api_router.get("/costumes/{costume_id}", response_model=Costume)
async def get_costume(costume_id: str):
    costume = await db.costumes.find_one({"id": costume_id}, {"_id": 0})
    if not costume:
        raise HTTPException(status_code=404, detail="Costume not found")
    if isinstance(costume.get('created_at'), str):
        costume['created_at'] = datetime.fromisoformat(costume['created_at'])
    return costume

@api_router.post("/costumes", response_model=Costume)
async def create_costume(costume_data: CostumeCreate, admin: dict = Depends(get_admin_user)):
    import uuid
    costume_doc = costume_data.model_dump()
    costume_doc["id"] = str(uuid.uuid4())
    costume_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.costumes.insert_one(costume_doc)
    costume_doc['created_at'] = datetime.fromisoformat(costume_doc['created_at'])
    return Costume(**costume_doc)

@api_router.put("/costumes/{costume_id}", response_model=Costume)
async def update_costume(costume_id: str, costume_data: CostumeCreate, admin: dict = Depends(get_admin_user)):
    update_data = costume_data.model_dump()
    result = await db.costumes.update_one({"id": costume_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Costume not found")
    
    costume = await db.costumes.find_one({"id": costume_id}, {"_id": 0})
    if isinstance(costume.get('created_at'), str):
        costume['created_at'] = datetime.fromisoformat(costume['created_at'])
    return Costume(**costume)

@api_router.delete("/costumes/{costume_id}")
async def delete_costume(costume_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.costumes.delete_one({"id": costume_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Costume not found")
    return {"message": "Costume deleted successfully"}

# Booking Routes
@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, current_user: dict = Depends(get_current_user)):
    import uuid
    
    # Get costume details
    costume = await db.costumes.find_one({"id": booking_data.costume_id}, {"_id": 0})
    if not costume:
        raise HTTPException(status_code=404, detail="Costume not found")
    
    booking_doc = {
        "id": str(uuid.uuid4()),
        "user_email": current_user["email"],
        "user_name": current_user["name"],
        "costume_id": booking_data.costume_id,
        "costume_name": costume["name"],
        "start_date": booking_data.start_date,
        "end_date": booking_data.end_date,
        "size": booking_data.size,
        "notes": booking_data.notes,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bookings.insert_one(booking_doc)
    booking_doc['created_at'] = datetime.fromisoformat(booking_doc['created_at'])
    return Booking(**booking_doc)

@api_router.get("/bookings", response_model=List[Booking])
async def get_user_bookings(current_user: dict = Depends(get_current_user)):
    query = {"user_email": current_user["email"]}
    bookings = await db.bookings.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for booking in bookings:
        if isinstance(booking.get('created_at'), str):
            booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return bookings

@api_router.get("/admin/bookings", response_model=List[Booking])
async def get_all_bookings(admin: dict = Depends(get_admin_user)):
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for booking in bookings:
        if isinstance(booking.get('created_at'), str):
            booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return bookings

@api_router.put("/admin/bookings/{booking_id}/status", response_model=Booking)
async def update_booking_status(booking_id: str, status_update: BookingStatusUpdate, admin: dict = Depends(get_admin_user)):
    result = await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": status_update.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if isinstance(booking.get('created_at'), str):
        booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return Booking(**booking)

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()