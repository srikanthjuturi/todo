from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Integer, String, func
from sqlalchemy.dialects.mssql import DATETIME2
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Todo(Base):
    """ORM model for the todos table.

    Attributes:
        id: Primary key.
        title: Required task title, max 255 characters.
        description: Optional task description, max 1000 characters.
        is_completed: Completion flag, defaults to False.
        created_at: Timestamp set on insert by the database.
        updated_at: Timestamp updated on every change by the database.
    """

    __tablename__ = "todos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DATETIME2, nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DATETIME2, nullable=False, server_default=func.now(), onupdate=func.now()
    )
    category_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("categories.id"), nullable=True
    )
    category: Mapped["Category" | None] = relationship(
        "Category",
        back_populates="todos",
        lazy="selectin",
    )
    tags: Mapped[list["Tag"]] = relationship(
        "Tag",
        secondary="todo_tags",
        back_populates="todos",
        lazy="selectin",
    )

    @property
    def category_name(self) -> str | None:
        return self.category.name if self.category is not None else None
