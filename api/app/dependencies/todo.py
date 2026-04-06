from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.repositories.todo_repository import TodoRepository
from app.services.todo_service import TodoService


async def get_todo_repository(
    session: Annotated[AsyncSession, Depends(get_db)],
) -> TodoRepository:
    """Provide a TodoRepository with an injected async session.

    Args:
        session: AsyncSession injected by FastAPI from get_db.

    Returns:
        TodoRepository bound to the active session.
    """
    return TodoRepository(session)


async def get_todo_service(
    repository: Annotated[TodoRepository, Depends(get_todo_repository)],
) -> TodoService:
    """Provide a TodoService with an injected TodoRepository.

    Args:
        repository: TodoRepository injected by FastAPI from get_todo_repository.

    Returns:
        TodoService bound to the active repository.
    """
    return TodoService(repository)
