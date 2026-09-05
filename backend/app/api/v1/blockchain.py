from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import check_roles
from app.db.database import get_db
from app.db.models import BlockchainBlock, RoleEnum, User
from app.schemas.document import BlockchainBlockResponse, BlockchainVerifyResponse
from app.services.blockchain import build_next_block, get_latest_block, verify_chain

router = APIRouter()


@router.get("/blockchain", response_model=list[BlockchainBlockResponse])
def list_blocks(db: Session = Depends(get_db), _: User = Depends(check_roles([RoleEnum.ADMIN]))):
    return db.query(BlockchainBlock).order_by(BlockchainBlock.block_number.desc()).limit(100).all()


@router.post("/blockchain/mine", response_model=BlockchainBlockResponse, status_code=status.HTTP_201_CREATED)
def mine_next_block(db: Session = Depends(get_db), _: User = Depends(check_roles([RoleEnum.ADMIN]))):
    block = build_next_block(db)
    if not block:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No pending audit logs to mine into a block")
    return block


@router.get("/blockchain/verify", response_model=BlockchainVerifyResponse)
def verify_blockchain(db: Session = Depends(get_db), _: User = Depends(check_roles([RoleEnum.ADMIN]))):
    valid, chain_length, invalid_ids = verify_chain(db)
    return BlockchainVerifyResponse(valid=valid, chain_length=chain_length, invalid_block_ids=invalid_ids)
