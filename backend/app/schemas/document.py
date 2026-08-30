from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentBase(BaseModel):
    filename: str
    document_type: str

class DocumentCreate(DocumentBase):
    asset_id: Optional[int] = None

class DocumentResponse(DocumentBase):
    id: int
    case_id: int
    asset_id: Optional[int]
    uploader_id: int
    sha256_hash: Optional[str]
    storage_path: Optional[str]
    ocr_text: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True
