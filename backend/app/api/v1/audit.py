from hashlib import sha256

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import check_roles
from app.db.database import get_db
from app.db.models import AuditLog, RoleEnum, User
from app.schemas.document import IntegrityVerificationResponse

router = APIRouter()


def audit_hash(entry: AuditLog) -> str:
    payload = "|".join(str(value) for value in (entry.previous_hash or "", entry.user_id, entry.action, entry.entity_type, entry.entity_id, entry.details or "", entry.timestamp.isoformat()))
    return sha256(payload.encode()).hexdigest()


@router.get("/audit-logs")
def get_audit_logs(db: Session = Depends(get_db), _: User = Depends(check_roles([RoleEnum.ADMIN]))):
    return db.query(AuditLog).order_by(AuditLog.id.desc()).limit(500).all()


@router.get("/audit-logs/verify", response_model=IntegrityVerificationResponse)
def verify_audit_chain(db: Session = Depends(get_db), _: User = Depends(check_roles([RoleEnum.ADMIN]))):
    previous_hash = None
    invalid = []
    entries = db.query(AuditLog).order_by(AuditLog.id).all()
    for entry in entries:
        is_genesis = entry.id == 1
        expected_previous = None if is_genesis else previous_hash
        if entry.previous_hash != expected_previous or entry.entry_hash != audit_hash(entry):
            invalid.append(entry.id)
        previous_hash = entry.entry_hash
    return IntegrityVerificationResponse(valid=not invalid, checked_versions=len(entries), invalid_version_ids=invalid)
