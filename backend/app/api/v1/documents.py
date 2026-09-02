from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import Document, Case, User, RoleEnum
from app.schemas.document import DocumentCreate, DocumentResponse
from app.core.dependencies import get_current_user, check_roles, log_audit

router = APIRouter()

@router.post("/cases/{case_id}/documents", response_model=DocumentResponse)
def create_document_metadata(
    case_id: int,
    doc_in: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_roles([RoleEnum.ADMIN, RoleEnum.IO, RoleEnum.FORENSIC_EXPERT]))
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    new_doc = Document(
        **doc_in.model_dump(),
        case_id=case_id,
        uploader_id=current_user.id,
        sha256_hash="PENDING", # Placeholder for actual hash in future phase
        storage_path="PENDING" # Placeholder
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    log_audit(db, current_user.id, "CREATE_DOCUMENT_METADATA", "Document", new_doc.id)
    return new_doc

@router.get("/cases/{case_id}/documents", response_model=List[DocumentResponse])
def get_documents(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if current_user.role == RoleEnum.IO and case.assigned_io_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return db.query(Document).filter(Document.case_id == case_id).all()

@router.get("/cases/{case_id}/documents", response_model=List[DocumentResponse])
def get_documents(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if current_user.role == RoleEnum.IO and case.assigned_io_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return db.query(Document).filter(Document.case_id == case_id).all()
