from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import Case, User, RoleEnum
from app.schemas.case import CaseCreate, CaseResponse, CaseUpdate
from app.core.dependencies import get_current_user, check_roles, log_audit

router = APIRouter()

@router.post("", response_model=CaseResponse)
def create_case(
    case_in: CaseCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(check_roles([RoleEnum.ADMIN, RoleEnum.IO]))
):
    # Ensure assigned IO exists
    assigned_io = db.query(User).filter(User.id == case_in.assigned_io_id).first()
    if not assigned_io or assigned_io.role != RoleEnum.IO:
        raise HTTPException(status_code=400, detail="Invalid IO assigned")
    
    db_case = db.query(Case).filter(Case.case_number == case_in.case_number).first()
    if db_case:
        raise HTTPException(status_code=400, detail="Case number already exists")

    new_case = Case(**case_in.model_dump())
    db.add(new_case)
    db.commit()
    db.refresh(new_case)
    log_audit(db, current_user.id, "CREATE_CASE", "Case", new_case.id)
    return new_case

@router.get("", response_model=List[CaseResponse])
def get_cases(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == RoleEnum.IO:
        return db.query(Case).filter(Case.assigned_io_id == current_user.id).all()
    elif current_user.role in [RoleEnum.ADMIN, RoleEnum.JUDGE]:
        return db.query(Case).all()
    return []

@router.get("/{case_id}", response_model=CaseResponse)
def get_case(case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if current_user.role == RoleEnum.IO and case.assigned_io_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this case")
    return case

@router.put("/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: int, 
    case_in: CaseUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(check_roles([RoleEnum.ADMIN, RoleEnum.IO]))
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if current_user.role == RoleEnum.IO and case.assigned_io_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this case")

    update_data = case_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(case, k, v)
    db.commit()
    db.refresh(case)
    log_audit(db, current_user.id, "UPDATE_CASE", "Case", case.id)
    return case
