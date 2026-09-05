from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    IO = "IO"
    FORENSIC_EXPERT = "FORENSIC_EXPERT"
    JUDGE = "JUDGE"

class CaseStatusEnum(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"

class AssetStatusEnum(str, enum.Enum):
    LOGGED = "LOGGED"
    IN_TRANSIT = "IN_TRANSIT"
    IN_LAB = "IN_LAB"
    IN_COURT = "IN_COURT"
    ARCHIVED = "ARCHIVED"
    DISPOSED = "DISPOSED"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(Enum(RoleEnum))
    badge_number = Column(String, nullable=True)
    department = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String, unique=True, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    status = Column(Enum(CaseStatusEnum), default=CaseStatusEnum.OPEN)
    assigned_io_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    assigned_io = relationship("User")
    assets = relationship("Asset", back_populates="case")
    documents = relationship("Document", back_populates="case")

class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True, index=True)
    asset_number = Column(String, unique=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    name = Column(String)
    description = Column(Text, nullable=True)
    asset_type = Column(String)
    status = Column(Enum(AssetStatusEnum), default=AssetStatusEnum.LOGGED)
    current_custodian_id = Column(Integer, ForeignKey("users.id"))
    location = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    case = relationship("Case", back_populates="assets")
    current_custodian = relationship("User")
    lifecycle_events = relationship("AssetLifecycleEvent", back_populates="asset")
    documents = relationship("Document", back_populates="asset")

class AssetLifecycleEvent(Base):
    __tablename__ = "asset_lifecycle_events"
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    action = Column(String)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    performed_by = Column(Integer, ForeignKey("users.id"))
    from_status = Column(Enum(AssetStatusEnum), nullable=True)
    to_status = Column(Enum(AssetStatusEnum))
    location = Column(String, nullable=True)
    remarks = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    asset = relationship("Asset", back_populates="lifecycle_events")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=True)
    filename = Column(String)
    document_type = Column(String)
    uploader_id = Column(Integer, ForeignKey("users.id"))
    sha256_hash = Column(String, nullable=True)
    storage_path = Column(String, nullable=True)
    ocr_text = Column(Text, nullable=True)
    current_version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    case = relationship("Case", back_populates="documents")
    asset = relationship("Asset", back_populates="documents")
    uploader = relationship("User")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")

class DocumentVersion(Base):
    __tablename__ = "document_versions"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    original_filename = Column(String, nullable=False)
    stored_filename = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    size_bytes = Column(Integer, nullable=False)
    sha256_hash = Column(String, nullable=False)
    ocr_text = Column(Text, nullable=True)
    ocr_status = Column(String, nullable=False, default="PENDING")
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="versions")
    uploaded_by = relationship("User")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    entity_type = Column(String)
    entity_id = Column(Integer)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    previous_hash = Column(String, nullable=True)
    entry_hash = Column(String, nullable=False, unique=True)

    user = relationship("User")


class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    body = Column(Text, nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", backref="comments")
    user = relationship("User")
    replies = relationship("Comment", backref="parent", remote_side=[id])


class DocumentPermission(Base):
    __tablename__ = "document_permissions"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    permission = Column(String, nullable=False, default="READ")  # READ | WRITE
    granted_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", backref="permissions")
    user = relationship("User", foreign_keys=[user_id])
    granted_by = relationship("User", foreign_keys=[granted_by_id])


class BlockchainBlock(Base):
    __tablename__ = "blockchain_blocks"
    id = Column(Integer, primary_key=True, index=True)
    block_number = Column(Integer, nullable=False, unique=True)
    previous_hash = Column(String, nullable=False)
    data_hash = Column(String, nullable=False)  # hash of audit_log ids in this block
    block_hash = Column(String, nullable=False, unique=True)
    nonce = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
