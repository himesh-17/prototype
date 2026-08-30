from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.db.models import AssetStatusEnum

class AssetBase(BaseModel):
    asset_number: str
    name: str
    description: Optional[str] = None
    asset_type: str
    status: AssetStatusEnum = AssetStatusEnum.LOGGED
    location: Optional[str] = None

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    asset_type: Optional[str] = None
    location: Optional[str] = None

class AssetTransfer(BaseModel):
    to_user_id: int
    new_status: AssetStatusEnum
    location: Optional[str] = None
    remarks: Optional[str] = None

class AssetResponse(AssetBase):
    id: int
    case_id: int
    current_custodian_id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class AssetLifecycleEventResponse(BaseModel):
    id: int
    asset_id: int
    action: str
    from_user_id: Optional[int]
    to_user_id: Optional[int]
    performed_by: int
    from_status: Optional[AssetStatusEnum]
    to_status: AssetStatusEnum
    location: Optional[str]
    remarks: Optional[str]
    timestamp: datetime
    class Config:
        from_attributes = True
