import logging

from fastapi import HTTPException

from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate

logger = logging.getLogger(__name__)


class CategoryService:
    """Business logic layer for category operations."""

    def __init__(self, repository: CategoryRepository) -> None:
        self.repository = repository

    async def get_all(self) -> list[Category]:
        return await self.repository.get_all()

    async def get_by_id(self, category_id: int) -> Category:
        category = await self.repository.get_by_id(category_id)
        if category is None:
            raise HTTPException(status_code=404, detail="Category not found")
        return category

    async def create(self, payload: CategoryCreate) -> Category:
        existing = await self.repository.get_by_name(payload.name)
        if existing is not None:
            raise HTTPException(status_code=409, detail="Category name already exists")

        category = await self.repository.create(payload)
        await self.repository.session.commit()
        await self.repository.session.refresh(category)
        logger.info("Created category id=%d", category.id)
        return category

    async def update(self, category_id: int, payload: CategoryUpdate) -> Category:
        category = await self.get_by_id(category_id)
        if payload.name is not None:
            existing = await self.repository.get_by_name(payload.name)
            if existing is not None and existing.id != category_id:
                raise HTTPException(status_code=409, detail="Category name already exists")

        updated = await self.repository.update(category_id, payload)
        if updated is None:
            raise HTTPException(status_code=404, detail="Category not found")
        await self.repository.session.commit()
        await self.repository.session.refresh(updated)
        logger.info("Updated category id=%d", category_id)
        return updated

    async def delete(self, category_id: int) -> None:
        await self.get_by_id(category_id)
        if await self.repository.has_todos(category_id):
            raise HTTPException(status_code=409, detail="Category has assigned todos")

        deleted = await self.repository.delete(category_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Category not found")
        await self.repository.session.commit()
        logger.info("Deleted category id=%d", category_id)
