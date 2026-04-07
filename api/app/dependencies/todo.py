from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.category import get_category_repository
from app.dependencies.tag import get_tag_repository
from app.repositories.category_repository import CategoryRepository
from app.repositories.tag_repository import TagRepository
from app.repositories.todo_repository import TodoRepository
from app.services.todo_service import TodoService


async def get_todo_repository(
    session: Annotated[AsyncSession, Depends(get_db)],
) -> TodoRepository:
    return TodoRepository(session)


async def get_todo_service(
    repository: Annotated[TodoRepository, Depends(get_todo_repository)],
    category_repository: Annotated[CategoryRepository, Depends(get_category_repository)],
    tag_repository: Annotated[TagRepository, Depends(get_tag_repository)],
) -> TodoService:
    return TodoService(repository, category_repository, tag_repository)
