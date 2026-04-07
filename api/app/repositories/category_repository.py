import logging

from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.todo import Todo
from app.schemas.category import CategoryCreate, CategoryUpdate

logger = logging.getLogger(__name__)


class CategoryRepository:
    """Handles all SQLAlchemy queries for the categories table."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_all(self) -> list[Category]:
        result = await self.session.execute(select(Category).order_by(Category.name.asc()))
        return list(result.scalars().all())

    async def get_by_id(self, category_id: int) -> Category | None:
        result = await self.session.execute(select(Category).where(Category.id == category_id))
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Category | None:
        result = await self.session.execute(
            select(Category).where(func.lower(Category.name) == name.strip().lower())
        )
        return result.scalar_one_or_none()

    async def create(self, payload: CategoryCreate) -> Category:
        category = Category(name=payload.name)
        self.session.add(category)
        await self.session.flush()
        await self.session.refresh(category)
        return category

    async def update(self, category_id: int, payload: CategoryUpdate) -> Category | None:
        values = payload.model_dump(exclude_unset=True)
        if values:
            await self.session.execute(update(Category).where(Category.id == category_id).values(**values))
        return await self.get_by_id(category_id)

    async def delete(self, category_id: int) -> bool:
        result = await self.session.execute(delete(Category).where(Category.id == category_id))
        return result.rowcount > 0

    async def has_todos(self, category_id: int) -> bool:
        result = await self.session.execute(
            select(func.count()).select_from(Todo).where(Todo.category_id == category_id)
        )
        count = result.scalar_one()
        return count > 0
