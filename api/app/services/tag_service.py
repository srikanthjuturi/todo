import logging

from fastapi import HTTPException

from app.models.tag import Tag
from app.repositories.tag_repository import TagRepository
from app.schemas.tag import TagCreate, TagUpdate

logger = logging.getLogger(__name__)


class TagService:
    """Business logic layer for tag operations."""

    def __init__(self, repository: TagRepository) -> None:
        self.repository = repository

    async def get_all(self) -> list[Tag]:
        return await self.repository.get_all()

    async def get_by_id(self, tag_id: int) -> Tag:
        tag = await self.repository.get_by_id(tag_id)
        if tag is None:
            raise HTTPException(status_code=404, detail="Tag not found")
        return tag

    async def create(self, payload: TagCreate) -> Tag:
        existing = await self.repository.get_by_name(payload.name)
        if existing is not None:
            raise HTTPException(status_code=409, detail="Tag name already exists")

        tag = await self.repository.create(payload)
        await self.repository.session.commit()
        await self.repository.session.refresh(tag)
        logger.info("Created tag id=%d", tag.id)
        return tag

    async def update(self, tag_id: int, payload: TagUpdate) -> Tag:
        tag = await self.get_by_id(tag_id)
        if payload.name is not None:
            existing = await self.repository.get_by_name(payload.name)
            if existing is not None and existing.id != tag_id:
                raise HTTPException(status_code=409, detail="Tag name already exists")

        updated = await self.repository.update(tag_id, payload)
        if updated is None:
            raise HTTPException(status_code=404, detail="Tag not found")
        await self.repository.session.commit()
        await self.repository.session.refresh(updated)
        logger.info("Updated tag id=%d", tag_id)
        return updated

    async def delete(self, tag_id: int) -> None:
        await self.get_by_id(tag_id)
        deleted = await self.repository.delete(tag_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Tag not found")
        await self.repository.session.commit()
        logger.info("Deleted tag id=%d", tag_id)
