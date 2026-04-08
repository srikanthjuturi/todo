import pytest
from fastapi import HTTPException
from unittest.mock import MagicMock

from app.schemas.tag import TagCreate, TagUpdate
from app.services.tag_service import TagService
from tests.conftest import make_tag


class TestTagService:
    async def test_create_duplicate_name_raises_409(self, mock_tag_repository: MagicMock) -> None:
        existing = make_tag(id=2, name="Urgent")
        mock_tag_repository.get_by_name.return_value = existing
        service = TagService(mock_tag_repository)

        with pytest.raises(HTTPException) as exc_info:
            await service.create(TagCreate(name="Urgent"))

        assert exc_info.value.status_code == 409
        assert "already exists" in str(exc_info.value.detail)

    async def test_update_duplicate_name_raises_409(self, mock_tag_repository: MagicMock) -> None:
        tag = make_tag(id=1, name="Low")
        existing = make_tag(id=2, name="High")
        mock_tag_repository.get_by_id.return_value = tag
        mock_tag_repository.get_by_name.return_value = existing
        service = TagService(mock_tag_repository)

        with pytest.raises(HTTPException) as exc_info:
            await service.update(1, TagUpdate(name="High"))

        assert exc_info.value.status_code == 409
        assert "already exists" in str(exc_info.value.detail)

    async def test_delete_removes_associations_but_not_todos(
        self, mock_tag_repository: MagicMock
    ) -> None:
        mock_tag_repository.get_by_id.return_value = make_tag(id=1, name="Urgent")
        mock_tag_repository.delete.return_value = True
        service = TagService(mock_tag_repository)

        await service.delete(1)

        mock_tag_repository.delete.assert_awaited_once_with(1)
        mock_tag_repository.session.commit.assert_awaited_once()
        # Only tag-repository methods are called; no todo deletion occurs
        mock_tag_repository.get_all.assert_not_called()
