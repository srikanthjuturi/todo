from unittest.mock import AsyncMock, MagicMock, call

import pytest

from app.repositories.todo_repository import TodoRepository
from app.schemas.todo import TodoCreate, TodoUpdate
from tests.conftest import make_todo


class TestGetAll:
    async def test_get_all_executes_select_returns_todos(
        self, mock_session: AsyncMock
    ) -> None:
        sample = make_todo()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [sample]
        mock_session.execute.return_value = mock_result
        repo = TodoRepository(mock_session)

        result = await repo.get_all()

        assert result == [sample]
        mock_session.execute.assert_awaited_once()

    async def test_get_all_empty_table_returns_empty_list(
        self, mock_session: AsyncMock
    ) -> None:
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_session.execute.return_value = mock_result
        repo = TodoRepository(mock_session)

        result = await repo.get_all()

        assert result == []


class TestGetById:
    async def test_get_by_id_found_returns_todo(
        self, mock_session: AsyncMock
    ) -> None:
        sample = make_todo()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample
        mock_session.execute.return_value = mock_result
        repo = TodoRepository(mock_session)

        result = await repo.get_by_id(1)

        assert result is sample
        mock_session.execute.assert_awaited_once()

    async def test_get_by_id_not_found_returns_none(
        self, mock_session: AsyncMock
    ) -> None:
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result
        repo = TodoRepository(mock_session)

        result = await repo.get_by_id(99)

        assert result is None


class TestCreate:
    async def test_create_adds_to_session_and_flushes(
        self, mock_session: AsyncMock
    ) -> None:
        payload = TodoCreate(title="New todo", description="Details")
        repo = TodoRepository(mock_session)

        result = await repo.create(payload)

        mock_session.add.assert_called_once()
        added_todo = mock_session.add.call_args[0][0]
        assert added_todo.title == "New todo"
        assert added_todo.description == "Details"
        mock_session.flush.assert_awaited_once()
        mock_session.refresh.assert_awaited_once_with(added_todo)
        assert result is added_todo

    async def test_create_without_description_sets_none(
        self, mock_session: AsyncMock
    ) -> None:
        payload = TodoCreate(title="No desc")
        repo = TodoRepository(mock_session)

        result = await repo.create(payload)

        added_todo = mock_session.add.call_args[0][0]
        assert added_todo.description is None


class TestUpdate:
    async def test_update_with_values_executes_update_stmt(
        self, mock_session: AsyncMock
    ) -> None:
        updated = make_todo(title="Updated")
        mock_result_update = MagicMock()
        mock_result_select = MagicMock()
        mock_result_select.scalar_one_or_none.return_value = updated
        mock_session.execute.side_effect = [mock_result_update, mock_result_select]
        payload = TodoUpdate(title="Updated")
        repo = TodoRepository(mock_session)

        result = await repo.update(1, payload)

        assert result is updated
        assert mock_session.execute.await_count == 2

    async def test_update_with_empty_payload_skips_update_stmt(
        self, mock_session: AsyncMock
    ) -> None:
        sample = make_todo()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample
        mock_session.execute.return_value = mock_result
        payload = TodoUpdate()
        repo = TodoRepository(mock_session)

        result = await repo.update(1, payload)

        assert result is sample
        mock_session.execute.assert_awaited_once()

    async def test_update_not_found_returns_none(
        self, mock_session: AsyncMock
    ) -> None:
        mock_result_update = MagicMock()
        mock_result_select = MagicMock()
        mock_result_select.scalar_one_or_none.return_value = None
        mock_session.execute.side_effect = [mock_result_update, mock_result_select]
        payload = TodoUpdate(title="Ghost")
        repo = TodoRepository(mock_session)

        result = await repo.update(99, payload)

        assert result is None


class TestDelete:
    async def test_delete_existing_todo_returns_true(
        self, mock_session: AsyncMock
    ) -> None:
        mock_result = MagicMock()
        mock_result.rowcount = 1
        mock_session.execute.return_value = mock_result
        repo = TodoRepository(mock_session)

        result = await repo.delete(1)

        assert result is True
        mock_session.execute.assert_awaited_once()

    async def test_delete_missing_todo_returns_false(
        self, mock_session: AsyncMock
    ) -> None:
        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result
        repo = TodoRepository(mock_session)

        result = await repo.delete(99)

        assert result is False
