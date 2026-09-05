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


class CommentCreate(BaseModel):
    body: str
    parent_id: Optional[int] = None

class CommentResponse(BaseModel):
    id: int
    document_id: int
    user_id: int
    body: str
    parent_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentPermissionCreate(BaseModel):
    user_id: int
    permission: str = "READ"  # READ | WRITE

class DocumentPermissionResponse(BaseModel):
    id: int
    document_id: int
    user_id: int
    permission: str
    granted_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RetentionResponse(BaseModel):
    archived_count: int
    deleted_count: int
    message: str


class BlockchainBlockResponse(BaseModel):
    id: int
    block_number: int
    previous_hash: str
    data_hash: str
    block_hash: str
    nonce: int
    created_at: datetime

    class Config:
        from_attributes = True


class BlockchainVerifyResponse(BaseModel):
    valid: bool
    chain_length: int
    invalid_block_ids: list[int] = []
