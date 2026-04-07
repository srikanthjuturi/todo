"""create_categories_tags

Revision ID: 002
Revises: 001
Create Date: 2026-04-07
"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects.mssql import DATETIME2
from alembic import op

revision: str = "002"
down_revision: str = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
        sa.Column("created_at", DATETIME2(), nullable=False, server_default=sa.text("GETDATE()")),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "tags",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(50), nullable=False, unique=True),
        sa.Column("created_at", DATETIME2(), nullable=False, server_default=sa.text("GETDATE()")),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "todo_tags",
        sa.Column("todo_id", sa.Integer(), sa.ForeignKey("todos.id", ondelete="CASCADE"), primary_key=True, nullable=False),
        sa.Column("tag_id", sa.Integer(), sa.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True, nullable=False),
    )

    op.add_column(
        "todos",
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("categories.id"), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("todos", "category_id")
    op.drop_table("todo_tags")
    op.drop_table("tags")
    op.drop_table("categories")
