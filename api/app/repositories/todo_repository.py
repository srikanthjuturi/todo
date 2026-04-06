import logging

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate

logger = logging.getLogger(__name__)


class TodoRepository:
    """Handles all SQLAlchemy queries for the todos table.

    Attributes:
        session: The active async database session.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_all(self) -> list[Todo]:
        """Fetch all todos ordered by creation date descending.

        Returns:
            List of Todo ORM objects.
        """
        result = await self.session.execute(
            select(Todo).order_by(Todo.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, todo_id: int) -> Todo | None:
        """Fetch a single todo by primary key.

        Args:
            todo_id: The primary key of the todo.

        Returns:
            Todo ORM object if found, otherwise None.
        """
        result = await self.session.execute(
            select(Todo).where(Todo.id == todo_id)
        )
        return result.scalar_one_or_none()

    async def create(self, payload: TodoCreate) -> Todo:
        """Insert a new todo row and return the persisted object.

        Args:
            payload: Validated create schema.

        Returns:
            The newly created Todo ORM object.
        """
        todo = Todo(
            title=payload.title,
            description=payload.description,
        )
        self.session.add(todo)
        await self.session.flush()
        await self.session.refresh(todo)
        return todo

    async def update(self, todo_id: int, payload: TodoUpdate) -> Todo | None:
        """Update fields on an existing todo.

        Args:
            todo_id: Primary key of the todo to update.
            payload: Validated update schema containing only the fields to change.

        Returns:
            Updated Todo ORM object if found, otherwise None.
        """
        values = payload.model_dump(exclude_unset=True)
        if not values:
            return await self.get_by_id(todo_id)

        await self.session.execute(
            update(Todo).where(Todo.id == todo_id).values(**values)
        )
        return await self.get_by_id(todo_id)

    async def delete(self, todo_id: int) -> bool:
        """Delete a todo by primary key.

        Args:
            todo_id: Primary key of the todo to delete.

        Returns:
            True if a row was deleted, False if not found.
        """
        result = await self.session.execute(
            delete(Todo).where(Todo.id == todo_id)
        )
        return result.rowcount > 0
