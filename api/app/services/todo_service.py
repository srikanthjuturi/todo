import logging

from fastapi import HTTPException

from app.models.todo import Todo
from app.repositories.todo_repository import TodoRepository
from app.schemas.todo import TodoCreate, TodoUpdate

logger = logging.getLogger(__name__)


class TodoService:
    """Business logic layer for todo operations.

    Attributes:
        repository: The TodoRepository instance for DB access.
    """

    def __init__(self, repository: TodoRepository) -> None:
        self.repository = repository

    async def get_all(self) -> list[Todo]:
        """Return all todos ordered by creation date descending.

        Returns:
            List of Todo ORM objects.
        """
        return await self.repository.get_all()

    async def get_by_id(self, todo_id: int) -> Todo:
        """Return a single todo or raise 404 if not found.

        Args:
            todo_id: Primary key of the todo.

        Returns:
            The matching Todo ORM object.

        Raises:
            HTTPException: 404 if no todo with the given id exists.
        """
        todo = await self.repository.get_by_id(todo_id)
        if todo is None:
            raise HTTPException(status_code=404, detail="Todo not found")
        return todo

    async def create(self, payload: TodoCreate) -> Todo:
        """Create and persist a new todo.

        Args:
            payload: Validated TodoCreate schema.

        Returns:
            The newly created Todo ORM object.
        """
        todo = await self.repository.create(payload)
        await self.repository.session.commit()
        await self.repository.session.refresh(todo)
        logger.info("Created todo id=%d", todo.id)
        return todo

    async def update(self, todo_id: int, payload: TodoUpdate) -> Todo:
        """Update an existing todo or raise 404 if not found.

        Args:
            todo_id: Primary key of the todo to update.
            payload: Validated TodoUpdate schema.

        Returns:
            The updated Todo ORM object.

        Raises:
            HTTPException: 404 if no todo with the given id exists.
        """
        await self.get_by_id(todo_id)
        todo = await self.repository.update(todo_id, payload)
        if todo is None:
            raise HTTPException(status_code=404, detail="Todo not found")
        await self.repository.session.commit()
        await self.repository.session.refresh(todo)
        logger.info("Updated todo id=%d", todo_id)
        return todo

    async def delete(self, todo_id: int) -> None:
        """Delete a todo or raise 404 if not found.

        Args:
            todo_id: Primary key of the todo to delete.

        Raises:
            HTTPException: 404 if no todo with the given id exists.
        """
        deleted = await self.repository.delete(todo_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Todo not found")
        await self.repository.session.commit()
        logger.info("Deleted todo id=%d", todo_id)
