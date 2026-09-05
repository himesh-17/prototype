from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, log_audit
from app.core.dependencies import check_roles
from app.db.database import get_db
from app.db.models import Document, DocumentPermission, RoleEnum, User
from app.schemas.document import DocumentPermissionCreate, DocumentPermissionResponse

router = APIRouter()


@router.get("/documents/{document_id}/permissions", response_model=list[DocumentPermissionResponse])
def list_permissions(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if current_user.role not in {RoleEnum.ADMIN, RoleEnum.JUDGE}:
        if doc.uploader_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return db.query(DocumentPermission).filter(DocumentPermission.document_id == document_id).all()


@router.post("/documents/{document_id}/permissions", response_model=DocumentPermissionResponse, status_code=status.HTTP_201_CREATED)
def grant_permission(document_id: int, payload: DocumentPermissionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in {RoleEnum.ADMIN, RoleEnum.JUDGE}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins or judges can grant document permissions")
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    target_user = db.query(User).filter(User.id == payload.user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found")
    if payload.permission not in {"READ", "WRITE"}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Permission must be READ or WRITE")
    existing = db.query(DocumentPermission).filter(
        DocumentPermission.document_id == document_id,
        DocumentPermission.user_id == payload.user_id,
    ).first()
    if existing:
        existing.permission = payload.permission
        db.commit()
        db.refresh(existing)
        log_audit(db, current_user.id, "UPDATE_PERMISSION", "DocumentPermission", existing.id, details=f"document_id={document_id};user_id={payload.user_id};perm={payload.permission}")
        return existing
    perm = DocumentPermission(
        document_id=document_id,
        user_id=payload.user_id,
        permission=payload.permission,
        granted_by_id=current_user.id,
    )
    db.add(perm)
    db.commit()
    db.refresh(perm)
    log_audit(db, current_user.id, "GRANT_PERMISSION", "DocumentPermission", perm.id, details=f"document_id={document_id};user_id={payload.user_id};perm={payload.permission}")
    return perm


@router.delete("/documents/{document_id}/permissions/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_permission(document_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in {RoleEnum.ADMIN, RoleEnum.JUDGE}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins or judges can revoke document permissions")
    perm = db.query(DocumentPermission).filter(
        DocumentPermission.document_id == document_id,
        DocumentPermission.user_id == user_id,
    ).first()
    if not perm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not found")
    db.delete(perm)
    db.commit()
    log_audit(db, current_user.id, "REVOKE_PERMISSION", "DocumentPermission", perm.id, details=f"document_id={document_id};user_id={user_id}")
