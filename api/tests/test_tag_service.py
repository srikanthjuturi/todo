import pytest
from fastapi import HTTPException
from unittest.mock import MagicMock

from app.schemas.tag import TagCreate, TagUpdate
from app.services.tag_service import TagService
from tests.conftest import make_tag


class TestTagService:
    async def test_create_duplicate_name_raises_409(self, mock_repository: MagicMock) -> None:
        existing = make_tag(id=2, name="Urgent")
        mock_repository.get_by_name.return_value = existing
        service = TagService(mock_repository)

        with pytest.raises(HTTPException) as exc_info:
            await service.create(TagCreate(name="Urgent"))

        assert exc_info.value.status_code == 409
        assert "already exists" in str(exc_info.value.detail)

    async def test_update_duplicate_name_raises_409(self, mock_repository: MagicMock) -> None:
        tag = make_tag(id=1, name="Low")
        existing = make_tag(id=2, name="High")
        mock_repository.get_by_id.return_value = tag
        mock_repository.get_by_name.return_value = existing
        service = TagService(mock_repository)

        with pytest.raises(HTTPException) as exc_info:
            await service.update(1, TagUpdate(name="High"))

        assert exc_info.value.status_code == 409
        assert "already exists" in str(exc_info.value.detail)
