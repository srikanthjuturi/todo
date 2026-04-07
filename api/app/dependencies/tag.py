from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.repositories.tag_repository import TagRepository


async def get_tag_repository(
    session: Annotated[AsyncSession, Depends(get_db)],
) -> TagRepository:
    return TagRepository(session)


async def get_tag_service(
    repository: Annotated[TagRepository, Depends(get_tag_repository)],
) -> "TagService":
    from app.services.tag_service import TagService

    return TagService(repository)
