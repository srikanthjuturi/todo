import logging

from fastapi import HTTPException

from app.models.todo import Todo
from app.repositories.category_repository import CategoryRepository
from app.repositories.tag_repository import TagRepository
from app.repositories.todo_repository import TodoRepository
from app.schemas.todo import TodoCreate, TodoUpdate

logger = logging.getLogger(__name__)


class TodoService:
    """Business logic layer for todo operations.

    Attributes:
        repository: The TodoRepository instance for DB access.
        category_repository: The CategoryRepository instance for category validation.
        tag_repository: The TagRepository instance for tag validation.
    """

    def __init__(
        self,
        repository: TodoRepository,
        category_repository: CategoryRepository,
        tag_repository: TagRepository,
    ) -> None:
        self.repository = repository
        self.category_repository = category_repository
        self.tag_repository = tag_repository

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
        tags = await self._resolve_tags(payload.tag_ids)
        if payload.category_id is not None:
            await self._validate_category(payload.category_id)

        todo = await self.repository.create(payload, tags=tags)
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

        tags = None
        if "tag_ids" in payload.model_fields_set:
            tags = await self._resolve_tags(payload.tag_ids)

        if "category_id" in payload.model_fields_set and payload.category_id is not None:
            await self._validate_category(payload.category_id)

        todo = await self.repository.update(todo_id, payload, tags=tags)
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

    async def _validate_category(self, category_id: int) -> None:
        category = await self.category_repository.get_by_id(category_id)
        if category is None:
            raise HTTPException(status_code=404, detail="Category not found")

    async def _resolve_tags(self, tag_ids: list[int] | None) -> list[object] | None:
        if tag_ids is None:
            return None

        tags = []
        for tag_id in tag_ids:
            tag = await self.tag_repository.get_by_id(tag_id)
            if tag is None:
                raise HTTPException(status_code=404, detail=f"Tag {tag_id} not found")
            tags.append(tag)
        return tags
