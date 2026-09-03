from hashlib import sha256
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, log_audit
from app.db.database import get_db
from app.db.models import Asset, Case, Document, DocumentVersion, RoleEnum, User
from app.schemas.document import DocumentResponse, DocumentVersionResponse, IntegrityVerificationResponse
from app.services.document_storage import extract_ocr_text, safe_original_filename, store_upload

router = APIRouter()


def get_case_or_404(db: Session, case_id: int) -> Case:
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return case


def require_case_access(db: Session, user: User, case: Case, *, write: bool = False) -> None:
    if user.role in {RoleEnum.ADMIN, RoleEnum.JUDGE}:
        if write and user.role == RoleEnum.JUDGE:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Judges have read-only document access")
        return
    if user.role == RoleEnum.IO and case.assigned_io_id == user.id:
        return
    if user.role == RoleEnum.FORENSIC_EXPERT:
        has_custody = db.query(Asset.id).filter(Asset.case_id == case.id, Asset.current_custodian_id == user.id).first()
        if has_custody:
            return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this case")


def get_document_or_404(db: Session, document_id: int) -> Document:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return document


def ensure_asset_belongs_to_case(db: Session, asset_id: int | None, case_id: int) -> None:
    if asset_id is None:
        return
    if not db.query(Asset.id).filter(Asset.id == asset_id, Asset.case_id == case_id).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Asset does not belong to this case")


def sync_document_from_version(document: Document, version: DocumentVersion) -> None:
    document.filename = version.original_filename
    document.sha256_hash = version.sha256_hash
    document.storage_path = version.stored_filename
    document.ocr_text = version.ocr_text
    document.current_version = version.version_number


@router.post("/cases/{case_id}/documents/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    case_id: int,
    file: UploadFile = File(...),
    document_type: str = Form(..., min_length=2, max_length=100),
    asset_id: int | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = get_case_or_404(db, case_id)
    require_case_access(db, current_user, case, write=True)
    ensure_asset_belongs_to_case(db, asset_id, case_id)

    document = Document(
        case_id=case_id,
        asset_id=asset_id,
        filename=safe_original_filename(file.filename),
        document_type=document_type.strip().upper(),
        uploader_id=current_user.id,
        sha256_hash="",
        storage_path="",
        current_version=0,
    )
    db.add(document)
    db.flush()
    storage_path, content_type, size_bytes, digest = store_upload(file, case_id=case_id, document_id=document.id, version_number=1)
    ocr_text, ocr_status = extract_ocr_text(storage_path, content_type)
    version = DocumentVersion(
        document_id=document.id,
        version_number=1,
        original_filename=safe_original_filename(file.filename),
        stored_filename=storage_path,
        content_type=content_type,
        size_bytes=size_bytes,
        sha256_hash=digest,
        ocr_text=ocr_text,
        ocr_status=ocr_status,
        uploaded_by_id=current_user.id,
    )
    db.add(version)
    sync_document_from_version(document, version)
    db.commit()
    db.refresh(document)
    log_audit(db, current_user.id, "UPLOAD_DOCUMENT", "Document", document.id, details=f"version=1;sha256={digest}")
    return document


@router.post("/cases/{case_id}/documents/{document_id}/versions", response_model=DocumentVersionResponse, status_code=status.HTTP_201_CREATED)
def upload_document_version(
    case_id: int,
    document_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = get_case_or_404(db, case_id)
    require_case_access(db, current_user, case, write=True)
    document = get_document_or_404(db, document_id)
    if document.case_id != case_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found in this case")

    version_number = document.current_version + 1
    storage_path, content_type, size_bytes, digest = store_upload(file, case_id=case_id, document_id=document.id, version_number=version_number)
    ocr_text, ocr_status = extract_ocr_text(storage_path, content_type)
    version = DocumentVersion(
        document_id=document.id,
        version_number=version_number,
        original_filename=safe_original_filename(file.filename),
        stored_filename=storage_path,
        content_type=content_type,
        size_bytes=size_bytes,
        sha256_hash=digest,
        ocr_text=ocr_text,
        ocr_status=ocr_status,
        uploaded_by_id=current_user.id,
    )
    db.add(version)
    sync_document_from_version(document, version)
    db.commit()
    db.refresh(version)
    log_audit(db, current_user.id, "UPLOAD_DOCUMENT_VERSION", "Document", document.id, details=f"version={version_number};sha256={digest}")
    return version


@router.get("/cases/{case_id}/documents", response_model=list[DocumentResponse])
def get_documents(case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = get_case_or_404(db, case_id)
    require_case_access(db, current_user, case)
    return db.query(Document).filter(Document.case_id == case_id).order_by(Document.created_at.desc()).all()


@router.get("/documents/search", response_model=list[DocumentResponse])
def search_documents(query: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    term = query.strip()
    if len(term) < 2:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Search query must contain at least two characters")
    matches = (
        db.query(Document)
        .outerjoin(DocumentVersion, DocumentVersion.document_id == Document.id)
        .filter(or_(Document.filename.ilike(f"%{term}%"), Document.ocr_text.ilike(f"%{term}%"), DocumentVersion.ocr_text.ilike(f"%{term}%")))
        .distinct()
        .all()
    )
    authorized = []
    for document in matches:
        try:
            require_case_access(db, current_user, document.case)
            authorized.append(document)
        except HTTPException:
            continue
    log_audit(db, current_user.id, "SEARCH_DOCUMENTS", "Document", 0, details=f"query_length={len(term)};matches={len(authorized)}")
    return authorized


@router.get("/documents/{document_id}/versions", response_model=list[DocumentVersionResponse])
def get_document_versions(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document = get_document_or_404(db, document_id)
    require_case_access(db, current_user, document.case)
    return db.query(DocumentVersion).filter(DocumentVersion.document_id == document_id).order_by(DocumentVersion.version_number.desc()).all()


@router.get("/documents/{document_id}/versions/{version_number}/download")
def download_document_version(document_id: int, version_number: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document = get_document_or_404(db, document_id)
    require_case_access(db, current_user, document.case)
    version = db.query(DocumentVersion).filter(DocumentVersion.document_id == document_id, DocumentVersion.version_number == version_number).first()
    if not version or not Path(version.stored_filename).is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document version not found")
    log_audit(db, current_user.id, "DOWNLOAD_DOCUMENT", "Document", document_id, details=f"version={version_number}")
    return FileResponse(version.stored_filename, media_type=version.content_type, filename=version.original_filename, headers={"Cache-Control": "no-store"})


@router.get("/documents/{document_id}/verify", response_model=IntegrityVerificationResponse)
def verify_document_integrity(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document = get_document_or_404(db, document_id)
    require_case_access(db, current_user, document.case)
    versions = db.query(DocumentVersion).filter(DocumentVersion.document_id == document_id).all()
    invalid = [version.id for version in versions if not Path(version.stored_filename).is_file() or sha256(Path(version.stored_filename).read_bytes()).hexdigest() != version.sha256_hash]
    log_audit(db, current_user.id, "VERIFY_DOCUMENT", "Document", document_id, details=f"valid={not invalid};versions={len(versions)}")
    return IntegrityVerificationResponse(valid=not invalid, document_id=document_id, checked_versions=len(versions), invalid_version_ids=invalid)
