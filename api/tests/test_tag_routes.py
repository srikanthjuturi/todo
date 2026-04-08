from unittest.mock import MagicMock

from fastapi import HTTPException
from httpx import AsyncClient

from app.main import app
from app.dependencies.tag import get_tag_service
from tests.conftest import make_tag


async def test_list_tags_returns_empty(async_client: AsyncClient, mock_service: MagicMock) -> None:
    mock_service.get_all.return_value = []
    app.dependency_overrides[get_tag_service] = lambda: mock_service

    try:
        response = await async_client.get("/api/v1/tags")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200


async def test_create_tag_returns_201(async_client: AsyncClient, mock_service: MagicMock) -> None:
    mock_service.create.return_value = make_tag(id=1, name="Urgent")
    app.dependency_overrides[get_tag_service] = lambda: mock_service

    try:
        response = await async_client.post("/api/v1/tags", json={"name": "Urgent"})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 201
    body = response.json()
    assert body["isSuccess"] is True
    assert body["data"]["name"] == "Urgent"


async def test_get_tag_not_found_returns_404(async_client: AsyncClient, mock_service: MagicMock) -> None:
    mock_service.get_by_id.side_effect = HTTPException(status_code=404, detail="Tag not found")
    app.dependency_overrides[get_tag_service] = lambda: mock_service

    try:
        response = await async_client.get("/api/v1/tags/999")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 404
    body = response.json()
    assert body["isSuccess"] is False
