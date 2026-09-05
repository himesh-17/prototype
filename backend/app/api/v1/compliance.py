from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import check_roles, log_audit
from app.db.database import get_db
from app.db.models import AuditLog, Document, Case, CaseStatusEnum, RoleEnum, User
from app.schemas.document import RetentionResponse

router = APIRouter()

RETENTION_DAYS = 2555  # ~7 years default for legal documents


@router.get("/compliance/retention")
def get_retention_status(db: Session = Depends(get_db), _: User = Depends(check_roles([RoleEnum.ADMIN]))):
    cutoff = datetime.now(timezone.utc) - timedelta(days=RETENTION_DAYS)
    cases_to_archive = (
        db.query(Case)
        .filter(Case.status == CaseStatusEnum.CLOSED, Case.updated_at < cutoff)
        .count()
    )
    docs_to_review = (
        db.query(Document)
        .filter(Document.created_at < cutoff)
        .count()
    )
    return {
        "retention_days": RETENTION_DAYS,
        "cutoff_date": cutoff.isoformat(),
        "cases_eligible_for_archive": cases_to_archive,
        "documents_eligible_for_review": docs_to_review,
    }


@router.post("/compliance/retention/enforce", response_model=RetentionResponse)
def enforce_retention(db: Session = Depends(get_db), current_user: User = Depends(check_roles([RoleEnum.ADMIN]))):
    cutoff = datetime.now(timezone.utc) - timedelta(days=RETENTION_DAYS)

    cases = db.query(Case).filter(Case.status == CaseStatusEnum.CLOSED, Case.updated_at < cutoff).all()
    for case in cases:
        case.status = CaseStatusEnum.ARCHIVED
    archived_count = len(cases)

    # flag old documents for review (do not auto-delete legal evidence)
    old_docs = db.query(Document).filter(Document.created_at < cutoff).all()
    flagged_count = len(old_docs)

    db.commit()

    log_audit(
        db, current_user.id, "ENFORCE_RETENTION", "System", 0,
        details=f"archived_cases={archived_count};flagged_documents={flagged_count}",
    )

    return RetentionResponse(
        archived_count=archived_count,
        deleted_count=0,
        message=f"Archived {archived_count} closed cases; flagged {flagged_count} documents for review. Auto-deletion disabled for legal evidence preservation.",
    )
