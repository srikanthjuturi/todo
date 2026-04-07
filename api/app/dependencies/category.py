from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.repositories.category_repository import CategoryRepository


async def get_category_repository(
    session: Annotated[AsyncSession, Depends(get_db)],
) -> CategoryRepository:
    return CategoryRepository(session)


async def get_category_service(
    repository: Annotated[CategoryRepository, Depends(get_category_repository)],
) -> "CategoryService":
    from app.services.category_service import CategoryService

    return CategoryService(repository)
