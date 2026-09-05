from hashlib import sha256
from sqlalchemy.orm import Session
from app.db.models import AuditLog, BlockchainBlock

BLOCK_SIZE = 10  # audit logs per block
DIFFICULTY = 2   # leading zeros in block hash


def compute_block_hash(previous_hash: str, data_hash: str, nonce: int, block_number: int) -> str:
    payload = f"{block_number}|{previous_hash}|{data_hash}|{nonce}"
    return sha256(payload.encode()).hexdigest()


def compute_data_hash(log_ids: list[int], log_hashes: list[str]) -> str:
    payload = "|".join(f"{lid}:{lh}" for lid, lh in zip(log_ids, log_hashes))
    return sha256(payload.encode()).hexdigest()


def mine_block(previous_hash: str, data_hash: str, block_number: int) -> tuple[int, str]:
    nonce = 0
    while True:
        block_hash = compute_block_hash(previous_hash, data_hash, nonce, block_number)
        if block_hash.startswith("0" * DIFFICULTY):
            return nonce, block_hash
        nonce += 1


def get_latest_block(db: Session) -> BlockchainBlock | None:
    return db.query(BlockchainBlock).order_by(BlockchainBlock.block_number.desc()).first()


def build_next_block(db: Session) -> BlockchainBlock | None:
    latest = get_latest_block(db)
    last_block_number = latest.block_number if latest else 0
    last_hash = latest.block_hash if latest else "0" * 64

    pending_logs = (
        db.query(AuditLog)
        .filter(AuditLog.id > 0)
        .order_by(AuditLog.id)
        .offset(last_block_number * BLOCK_SIZE)
        .limit(BLOCK_SIZE)
        .all()
    )
    if not pending_logs:
        return None

    log_ids = [log.id for log in pending_logs]
    log_hashes = [log.entry_hash for log in pending_logs]
    data_hash = compute_data_hash(log_ids, log_hashes)
    nonce, block_hash = mine_block(last_hash, data_hash, last_block_number + 1)

    block = BlockchainBlock(
        block_number=last_block_number + 1,
        previous_hash=last_hash,
        data_hash=data_hash,
        block_hash=block_hash,
        nonce=nonce,
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


def verify_chain(db: Session) -> tuple[bool, int, list[int]]:
    blocks = db.query(BlockchainBlock).order_by(BlockchainBlock.block_number).all()
    if not blocks:
        return True, 0, []

    invalid = []
    expected_previous = "0" * 64
    for block in blocks:
        recomputed = compute_block_hash(block.previous_hash, block.data_hash, block.nonce, block.block_number)
        if block.previous_hash != expected_previous or block.block_hash != recomputed or not block.block_hash.startswith("0" * DIFFICULTY):
            invalid.append(block.id)
        expected_previous = block.block_hash

    return not invalid, len(blocks), invalid
