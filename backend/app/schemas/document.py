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
    current_version: int
    created_at: datetime
    class Config:
        from_attributes = True

class DocumentVersionResponse(BaseModel):
    id: int
    document_id: int
    version_number: int
    original_filename: str
    content_type: str
    size_bytes: int
    sha256_hash: str
    ocr_text: Optional[str]
    ocr_status: str
    uploaded_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class IntegrityVerificationResponse(BaseModel):
    valid: bool
    document_id: Optional[int] = None
    checked_versions: int = 0
    invalid_version_ids: list[int] = []
