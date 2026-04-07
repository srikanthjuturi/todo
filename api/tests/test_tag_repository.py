from unittest.mock import AsyncMock, MagicMock

import pytest

from app.repositories.tag_repository import TagRepository
from app.schemas.tag import TagCreate, TagUpdate
from tests.conftest import make_tag


class TestTagRepository:
    async def test_get_all_returns_tags(self, mock_session: AsyncMock) -> None:
        sample = make_tag(id=1, name="Urgent")
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [sample]
        mock_session.execute.return_value = mock_result
        repo = TagRepository(mock_session)

        result = await repo.get_all()

        assert result == [sample]
        mock_session.execute.assert_awaited_once()

    async def test_get_by_id_found_returns_tag(self, mock_session: AsyncMock) -> None:
        sample = make_tag(id=2, name="Low")
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample
        mock_session.execute.return_value = mock_result
        repo = TagRepository(mock_session)

        result = await repo.get_by_id(2)

        assert result is sample
        mock_session.execute.assert_awaited_once()

    async def test_get_by_name_found_returns_tag(self, mock_session: AsyncMock) -> None:
        sample = make_tag(id=3, name="Medium")
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample
        mock_session.execute.return_value = mock_result
        repo = TagRepository(mock_session)

        result = await repo.get_by_name("Medium")

        assert result is sample
        mock_session.execute.assert_awaited_once()

    async def test_create_inserts_tag(self, mock_session: AsyncMock) -> None:
        payload = TagCreate(name="Important")
        repo = TagRepository(mock_session)

        result = await repo.create(payload)

        mock_session.add.assert_called_once()
        added = mock_session.add.call_args[0][0]
        assert added.name == "Important"
        mock_session.flush.assert_awaited_once()
        mock_session.refresh.assert_awaited_once_with(added)
        assert result is added

    async def test_update_executes_update_and_returns_tag(self, mock_session: AsyncMock) -> None:
        updated = make_tag(id=1, name="Updated")
        mock_result_update = MagicMock()
        mock_result_select = MagicMock()
        mock_result_select.scalar_one_or_none.return_value = updated
        mock_session.execute.side_effect = [mock_result_update, mock_result_select]
        payload = TagUpdate(name="Updated")
        repo = TagRepository(mock_session)

        result = await repo.update(1, payload)

        assert result is updated
        assert mock_session.execute.await_count == 2

    async def test_delete_existing_tag_returns_true(self, mock_session: AsyncMock) -> None:
        mock_result = MagicMock()
        mock_result.rowcount = 1
        mock_session.execute.return_value = mock_result
        repo = TagRepository(mock_session)

        result = await repo.delete(1)

        assert result is True
