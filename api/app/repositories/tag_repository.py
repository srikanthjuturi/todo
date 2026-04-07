import logging

from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate

logger = logging.getLogger(__name__)


class TagRepository:
    """Handles all SQLAlchemy queries for the tags table."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_all(self) -> list[Tag]:
        result = await self.session.execute(select(Tag).order_by(Tag.name.asc()))
        return list(result.scalars().all())

    async def get_by_id(self, tag_id: int) -> Tag | None:
        result = await self.session.execute(select(Tag).where(Tag.id == tag_id))
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Tag | None:
        result = await self.session.execute(
            select(Tag).where(func.lower(Tag.name) == name.strip().lower())
        )
        return result.scalar_one_or_none()

    async def create(self, payload: TagCreate) -> Tag:
        tag = Tag(name=payload.name)
        self.session.add(tag)
        await self.session.flush()
        await self.session.refresh(tag)
        return tag

    async def update(self, tag_id: int, payload: TagUpdate) -> Tag | None:
        values = payload.model_dump(exclude_unset=True)
        if values:
            await self.session.execute(update(Tag).where(Tag.id == tag_id).values(**values))
        return await self.get_by_id(tag_id)

    async def delete(self, tag_id: int) -> bool:
        result = await self.session.execute(delete(Tag).where(Tag.id == tag_id))
        return result.rowcount > 0
