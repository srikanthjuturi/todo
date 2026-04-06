"""create_todos_table

Revision ID: 001
Revises:
Create Date: 2026-04-06
"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects.mssql import DATETIME2
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "todos",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.String(1000), nullable=True),
        sa.Column("is_completed", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", DATETIME2(), nullable=False, server_default=sa.text("GETDATE()")),
        sa.Column("updated_at", DATETIME2(), nullable=False, server_default=sa.text("GETDATE()")),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("todos")
