import pytest
from fastapi import HTTPException
from unittest.mock import MagicMock

from app.schemas.category import CategoryCreate, CategoryUpdate
from app.services.category_service import CategoryService
from tests.conftest import make_category


class TestCategoryService:
    async def test_create_duplicate_name_raises_409(self, mock_category_repository: MagicMock) -> None:
        existing = make_category(id=2, name="Work")
        mock_category_repository.get_by_name.return_value = existing
        service = CategoryService(mock_category_repository)

        with pytest.raises(HTTPException) as exc_info:
            await service.create(CategoryCreate(name="Work"))

        assert exc_info.value.status_code == 409
        assert "already exists" in str(exc_info.value.detail)

    async def test_update_duplicate_name_raises_409(self, mock_category_repository: MagicMock) -> None:
        category = make_category(id=1, name="Personal")
        existing = make_category(id=2, name="Work")
        mock_category_repository.get_by_id.return_value = category
        mock_category_repository.get_by_name.return_value = existing
        service = CategoryService(mock_category_repository)

        with pytest.raises(HTTPException) as exc_info:
            await service.update(1, CategoryUpdate(name="Work"))

        assert exc_info.value.status_code == 409
        assert "already exists" in str(exc_info.value.detail)

    async def test_delete_with_assigned_todos_raises_409(self, mock_category_repository: MagicMock) -> None:
        mock_category_repository.get_by_id.return_value = make_category(id=1, name="Work")
        mock_category_repository.has_todos.return_value = True
        service = CategoryService(mock_category_repository)

        with pytest.raises(HTTPException) as exc_info:
            await service.delete(1)

        assert exc_info.value.status_code == 409
        assert "assigned todos" in str(exc_info.value.detail)
