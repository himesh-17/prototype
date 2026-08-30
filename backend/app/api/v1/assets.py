from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import Asset, AssetLifecycleEvent, Case, User, RoleEnum
from app.schemas.asset import AssetCreate, AssetResponse, AssetUpdate, AssetTransfer, AssetLifecycleEventResponse
from app.core.dependencies import get_current_user, check_roles, log_audit

router = APIRouter()

@router.post("/cases/{case_id}/assets", response_model=AssetResponse)
def create_asset(
    case_id: int,
    asset_in: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_roles([RoleEnum.ADMIN, RoleEnum.IO]))
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if current_user.role == RoleEnum.IO and case.assigned_io_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized for this case")
    
    db_asset = db.query(Asset).filter(Asset.asset_number == asset_in.asset_number).first()
    if db_asset:
        raise HTTPException(status_code=400, detail="Asset number already exists")

    new_asset = Asset(**asset_in.model_dump(), case_id=case_id, current_custodian_id=current_user.id)
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    
    # Log lifecycle event
    event = AssetLifecycleEvent(
        asset_id=new_asset.id,
        action="LOG",
        from_user_id=None,
        to_user_id=current_user.id,
        performed_by=current_user.id,
        from_status=None,
        to_status=new_asset.status,
        location=new_asset.location,
        remarks="Asset logged"
    )
    db.add(event)
    db.commit()
    log_audit(db, current_user.id, "CREATE_ASSET", "Asset", new_asset.id)
    
    return new_asset

@router.get("/cases/{case_id}/assets", response_model=List[AssetResponse])
def get_assets(case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if current_user.role == RoleEnum.IO and case.assigned_io_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return db.query(Asset).filter(Asset.case_id == case_id).all()

@router.get("/assets/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    case = db.query(Case).filter(Case.id == asset.case_id).first()
    if current_user.role == RoleEnum.IO and case.assigned_io_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return asset

@router.put("/assets/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: int,
    asset_in: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_roles([RoleEnum.ADMIN, RoleEnum.IO]))
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    case = db.query(Case).filter(Case.id == asset.case_id).first()
    if current_user.role == RoleEnum.IO and case.assigned_io_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = asset_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(asset, k, v)
    db.commit()
    db.refresh(asset)
    log_audit(db, current_user.id, "UPDATE_ASSET", "Asset", asset.id)
    return asset

@router.post("/assets/{asset_id}/transfer", response_model=AssetResponse)
def transfer_asset(
    asset_id: int,
    transfer_in: AssetTransfer,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_roles([RoleEnum.ADMIN, RoleEnum.IO, RoleEnum.FORENSIC_EXPERT]))
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    if current_user.role not in [RoleEnum.ADMIN] and asset.current_custodian_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have custody of this asset")

    to_user = db.query(User).filter(User.id == transfer_in.to_user_id).first()
    if not to_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    old_status = asset.status
    asset.status = transfer_in.new_status
    asset.current_custodian_id = to_user.id
    if transfer_in.location:
        asset.location = transfer_in.location

    # Lifecycle event
    event = AssetLifecycleEvent(
        asset_id=asset.id,
        action="TRANSFER",
        from_user_id=current_user.id,
        to_user_id=to_user.id,
        performed_by=current_user.id,
        from_status=old_status,
        to_status=asset.status,
        location=asset.location,
        remarks=transfer_in.remarks
    )
    db.add(event)
    db.commit()
    db.refresh(asset)
    log_audit(db, current_user.id, "TRANSFER_ASSET", "Asset", asset.id, details=f"To user {to_user.id}")
    return asset
