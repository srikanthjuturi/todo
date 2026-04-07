import pytest
from fastapi import HTTPException
from unittest.mock import AsyncMock, MagicMock

from app.schemas.todo import TodoCreate, TodoUpdate
from app.services.todo_service import TodoService
from tests.conftest import make_category, make_todo


class TestGetAll:
    async def test_get_all_empty_list_returns_empty_list(
        self, mock_repository: MagicMock
    ) -> None:
        mock_repository.get_all.return_value = []
        service = TodoService(mock_repository, MagicMock(), MagicMock())

        result = await service.get_all()

        assert result == []
        mock_repository.get_all.assert_awaited_once()

    async def test_get_all_with_todos_returns_all_todos(
        self, mock_repository: MagicMock, sample_todo: object
    ) -> None:
        mock_repository.get_all.return_value = [sample_todo]
        service = TodoService(mock_repository, MagicMock(), MagicMock())

        result = await service.get_all()

        assert result == [sample_todo]
        mock_repository.get_all.assert_awaited_once()


class TestGetById:
    async def test_get_by_id_existing_todo_returns_todo(
        self, mock_repository: MagicMock, sample_todo: object
    ) -> None:
        mock_repository.get_by_id.return_value = sample_todo
        service = TodoService(mock_repository, MagicMock(), MagicMock())

        result = await service.get_by_id(1)

        assert result is sample_todo
        mock_repository.get_by_id.assert_awaited_once_with(1)

    async def test_get_by_id_missing_todo_raises_404(
        self, mock_repository: MagicMock
    ) -> None:
        mock_repository.get_by_id.return_value = None
        service = TodoService(mock_repository, MagicMock(), MagicMock())

        with pytest.raises(HTTPException) as exc_info:
            await service.get_by_id(99)

        assert exc_info.value.status_code == 404
        assert "not found" in exc_info.value.detail.lower()


class TestCreate:
    async def test_create_valid_payload_returns_new_todo(
        self, mock_repository: MagicMock, sample_todo: object
    ) -> None:
        mock_repository.create.return_value = sample_todo
        payload = TodoCreate(title="Test todo")
        service = TodoService(mock_repository, MagicMock(), MagicMock())

        result = await service.create(payload)

        assert result is sample_todo
        mock_repository.create.assert_awaited_once_with(payload)
        mock_repository.session.commit.assert_awaited_once()
        mock_repository.session.refresh.assert_awaited_once_with(sample_todo)

    async def test_create_invalid_category_id_raises_404(
        self, mock_repository: MagicMock
    ) -> None:
        category_repo = MagicMock()
        category_repo.get_by_id = AsyncMock(return_value=None)
        tag_repo = MagicMock()
        tag_repo.get_by_id = AsyncMock()
        payload = TodoCreate(title="Test todo", category_id=99)
        service = TodoService(mock_repository, category_repo, tag_repo)

        with pytest.raises(HTTPException) as exc_info:
            await service.create(payload)

        assert exc_info.value.status_code == 404

    async def test_create_invalid_tag_id_raises_404(
        self, mock_repository: MagicMock
    ) -> None:
        category_repo = MagicMock()
        category_repo.get_by_id = AsyncMock(return_value=make_category(id=1, name="Work"))
        tag_repo = MagicMock()
        tag_repo.get_by_id = AsyncMock(side_effect=[None])
        payload = TodoCreate(title="Test todo", tag_ids=[999])
        service = TodoService(mock_repository, category_repo, tag_repo)

        with pytest.raises(HTTPException) as exc_info:
            await service.create(payload)

        assert exc_info.value.status_code == 404


class TestUpdate:
    async def test_update_existing_todo_returns_updated_todo(
        self, mock_repository: MagicMock, sample_todo: object
    ) -> None:
        service = TodoService(mock_repository, MagicMock(), MagicMock())
        updated = make_todo(title="Updated title")
        mock_repository.get_by_id.return_value = sample_todo
        mock_repository.update.return_value = updated
        payload = TodoUpdate(title="Updated title")

        result = await service.update(1, payload)

        assert result is updated
        mock_repository.update.assert_awaited_once_with(1, payload)
        mock_repository.session.commit.assert_awaited_once()
        mock_repository.session.refresh.assert_awaited_once_with(updated)

    async def test_update_missing_todo_raises_404(
        self, mock_repository: MagicMock
    ) -> None:
        service = TodoService(mock_repository, MagicMock(), MagicMock())
        mock_repository.get_by_id.return_value = None
        payload = TodoUpdate(title="Updated title")

        with pytest.raises(HTTPException) as exc_info:
            await service.update(99, payload)

        assert exc_info.value.status_code == 404

    async def test_update_repo_returns_none_raises_404(
        self, mock_repository: MagicMock, sample_todo: object
    ) -> None:
        service = TodoService(mock_repository, MagicMock(), MagicMock())
        mock_repository.get_by_id.return_value = sample_todo
        mock_repository.update.return_value = None
        payload = TodoUpdate(title="Updated title")

        with pytest.raises(HTTPException) as exc_info:
            await service.update(1, payload)

        assert exc_info.value.status_code == 404


class TestDelete:
    async def test_delete_existing_todo_commits_successfully(
        self, mock_repository: MagicMock
    ) -> None:
        mock_repository.delete.return_value = True
        service = TodoService(mock_repository, MagicMock(), MagicMock())

        await service.delete(1)

        mock_repository.delete.assert_awaited_once_with(1)
        mock_repository.session.commit.assert_awaited_once()

    async def test_delete_missing_todo_raises_404(
        self, mock_repository: MagicMock
    ) -> None:
        mock_repository.delete.return_value = False
        service = TodoService(mock_repository, MagicMock(), MagicMock())

        with pytest.raises(HTTPException) as exc_info:
            await service.delete(99)

        assert exc_info.value.status_code == 404
        mock_repository.session.commit.assert_not_called()
