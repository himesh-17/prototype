from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.db.models import CaseStatusEnum

class CaseBase(BaseModel):
    case_number: str
    title: str
    description: Optional[str] = None
    status: CaseStatusEnum = CaseStatusEnum.OPEN
    assigned_io_id: int

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CaseStatusEnum] = None
    assigned_io_id: Optional[int] = None

class CaseResponse(CaseBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
