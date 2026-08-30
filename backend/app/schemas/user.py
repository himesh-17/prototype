from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.db.models import RoleEnum

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: RoleEnum
    badge_number: Optional[str] = None
    department: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None
