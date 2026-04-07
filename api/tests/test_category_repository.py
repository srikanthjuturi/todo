from unittest.mock import AsyncMock, MagicMock

import pytest

from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate
from tests.conftest import make_category


class TestCategoryRepository:
    async def test_get_all_returns_categories(self, mock_session: AsyncMock) -> None:
        sample = make_category(id=1, name="Work")
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [sample]
        mock_session.execute.return_value = mock_result
        repo = CategoryRepository(mock_session)

        result = await repo.get_all()

        assert result == [sample]
        mock_session.execute.assert_awaited_once()

    async def test_get_by_id_found_returns_category(self, mock_session: AsyncMock) -> None:
        sample = make_category(id=2, name="Personal")
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample
        mock_session.execute.return_value = mock_result
        repo = CategoryRepository(mock_session)

        result = await repo.get_by_id(2)

        assert result is sample
        mock_session.execute.assert_awaited_once()

    async def test_get_by_name_found_returns_category(self, mock_session: AsyncMock) -> None:
        sample = make_category(id=3, name="Work")
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample
        mock_session.execute.return_value = mock_result
        repo = CategoryRepository(mock_session)

        result = await repo.get_by_name("Work")

        assert result is sample
        mock_session.execute.assert_awaited_once()

    async def test_create_inserts_category(self, mock_session: AsyncMock) -> None:
        payload = CategoryCreate(name="Home")
        repo = CategoryRepository(mock_session)

        result = await repo.create(payload)

        mock_session.add.assert_called_once()
        added = mock_session.add.call_args[0][0]
        assert added.name == "Home"
        mock_session.flush.assert_awaited_once()
        mock_session.refresh.assert_awaited_once_with(added)
        assert result is added

    async def test_update_executes_update_and_returns_category(self, mock_session: AsyncMock) -> None:
        updated = make_category(id=1, name="Updated")
        mock_result_update = MagicMock()
        mock_result_select = MagicMock()
        mock_result_select.scalar_one_or_none.return_value = updated
        mock_session.execute.side_effect = [mock_result_update, mock_result_select]
        payload = CategoryUpdate(name="Updated")
        repo = CategoryRepository(mock_session)

        result = await repo.update(1, payload)

        assert result is updated
        assert mock_session.execute.await_count == 2

    async def test_delete_existing_category_returns_true(self, mock_session: AsyncMock) -> None:
        mock_result = MagicMock()
        mock_result.rowcount = 1
        mock_session.execute.return_value = mock_result
        repo = CategoryRepository(mock_session)

        result = await repo.delete(1)

        assert result is True

    async def test_has_todos_returns_true_when_count_positive(self, mock_session: AsyncMock) -> None:
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = 2
        mock_session.execute.return_value = mock_result
        repo = CategoryRepository(mock_session)

        result = await repo.has_todos(1)

        assert result is True
