from unittest.mock import MagicMock

from fastapi import HTTPException
from httpx import AsyncClient

from app.main import app
from app.dependencies.category import get_category_service


async def test_list_categories_returns_empty(async_client: AsyncClient, mock_service: MagicMock) -> None:
    mock_service.get_all.return_value = []
    app.dependency_overrides[get_category_service] = lambda: mock_service

    try:
        response = await async_client.get("/api/v1/categories")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200


async def test_create_category_returns_201(async_client: AsyncClient, mock_service: MagicMock) -> None:
    mock_service.create.return_value = MagicMock(id=1, name="Work")
    app.dependency_overrides[get_category_service] = lambda: mock_service

    try:
        response = await async_client.post("/api/v1/categories", json={"name": "Work"})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 201
    body = response.json()
    assert body["isSuccess"] is True
    assert body["data"]["name"] == "Work"


async def test_get_category_not_found_returns_404(async_client: AsyncClient, mock_service: MagicMock) -> None:
    mock_service.get_by_id.side_effect = HTTPException(status_code=404, detail="Category not found")
    app.dependency_overrides[get_category_service] = lambda: mock_service

    try:
        response = await async_client.get("/api/v1/categories/999")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 404
    body = response.json()
    assert body["isSuccess"] is False
