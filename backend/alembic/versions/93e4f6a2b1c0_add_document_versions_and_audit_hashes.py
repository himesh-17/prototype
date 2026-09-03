"""Add immutable document versions and audit hash chain.

Revision ID: 93e4f6a2b1c0
Revises: 345ba7afdbbe
Create Date: 2026-09-03
"""
import hashlib
from datetime import datetime, timezone

import sqlalchemy as sa
from alembic import op


revision = "93e4f6a2b1c0"
down_revision = "345ba7afdbbe"
branch_labels = None
depends_on = None


def _chain_hash(previous_hash: str | None, row: dict) -> str:
    timestamp = row.get("timestamp")
    iso = timestamp.isoformat() if isinstance(timestamp, datetime) else str(timestamp)
    payload = "|".join(
        str(value)
        for value in (
            previous_hash or "",
            row.get("user_id") or "",
            row.get("action") or "",
            row.get("entity_type") or "",
            row.get("entity_id") if row.get("entity_id") is not None else "",
            row.get("details") or "",
            iso,
        )
    )
    return hashlib.sha256(payload.encode()).hexdigest()


def upgrade() -> None:
    with op.batch_alter_table("audit_logs", recreate="always") as batch_op:
        batch_op.add_column(sa.Column("previous_hash", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("entry_hash", sa.String(), nullable=True))
        batch_op.create_unique_constraint("uq_audit_logs_entry_hash", ["entry_hash"])

    with op.batch_alter_table("documents", recreate="always") as batch_op:
        batch_op.add_column(sa.Column("current_version", sa.Integer(), nullable=False, server_default="1"))

    bind = op.get_bind()
    rows = bind.execute(
        sa.text(
            "SELECT id, user_id, action, entity_type, entity_id, details, timestamp "
            "FROM audit_logs ORDER BY id"
        )
    ).fetchall()
    previous_hash: str | None = None
    for row in rows:
        entry_hash = _chain_hash(previous_hash, dict(row._mapping))
        bind.execute(
            sa.text("UPDATE audit_logs SET previous_hash = :previous, entry_hash = :entry WHERE id = :id"),
            {"previous": previous_hash, "entry": entry_hash, "id": row.id},
        )
        previous_hash = entry_hash

    with op.batch_alter_table("audit_logs", recreate="always") as batch_op:
        batch_op.alter_column("entry_hash", existing_type=sa.String(), nullable=False)
        batch_op.alter_column("previous_hash", existing_type=sa.String(), nullable=True)

    op.create_table(
        "document_versions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("document_id", sa.Integer(), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("original_filename", sa.String(), nullable=False),
        sa.Column("stored_filename", sa.String(), nullable=False),
        sa.Column("content_type", sa.String(), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("sha256_hash", sa.String(), nullable=False),
        sa.Column("ocr_text", sa.Text(), nullable=True),
        sa.Column("ocr_status", sa.String(), nullable=False, server_default="PENDING"),
        sa.Column("uploaded_by_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"]),
        sa.ForeignKeyConstraint(["uploaded_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("document_id", "version_number", name="uq_document_versions_document_version"),
    )
    op.create_index("ix_document_versions_document_id", "document_versions", ["document_id"])


def downgrade() -> None:
    op.drop_index("ix_document_versions_document_id", table_name="document_versions")
    op.drop_table("document_versions")
    with op.batch_alter_table("audit_logs", recreate="always") as batch_op:
        batch_op.drop_constraint("uq_audit_logs_entry_hash", type_="unique")
        batch_op.drop_column("entry_hash")
        batch_op.drop_column("previous_hash")
    with op.batch_alter_table("documents", recreate="always") as batch_op:
        batch_op.drop_column("current_version")
