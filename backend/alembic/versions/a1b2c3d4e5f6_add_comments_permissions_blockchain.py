"""Add comments, document permissions, and blockchain blocks.

Revision ID: a1b2c3d4e5f6
Revises: 93e4f6a2b1c0
Create Date: 2026-09-05
"""
import sqlalchemy as sa
from alembic import op


revision = "a1b2c3d4e5f6"
down_revision = "93e4f6a2b1c0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "comments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("document_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("parent_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["parent_id"], ["comments.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_comments_document_id", "comments", ["document_id"])

    op.create_table(
        "document_permissions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("document_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("permission", sa.String(), nullable=False, server_default="READ"),
        sa.Column("granted_by_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["granted_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("document_id", "user_id", name="uq_document_permissions_doc_user"),
    )

    op.create_table(
        "blockchain_blocks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("block_number", sa.Integer(), nullable=False),
        sa.Column("previous_hash", sa.String(), nullable=False),
        sa.Column("data_hash", sa.String(), nullable=False),
        sa.Column("block_hash", sa.String(), nullable=False),
        sa.Column("nonce", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("block_number"),
        sa.UniqueConstraint("block_hash"),
    )


def downgrade() -> None:
    op.drop_table("blockchain_blocks")
    op.drop_table("document_permissions")
    op.drop_index("ix_comments_document_id", table_name="comments")
    op.drop_table("comments")
