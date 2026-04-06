from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException
from httpx import AsyncClient

from tests.conftest import make_todo


class TestListTodos:
    async def test_list_todos_empty_returns_200_with_empty_data(
        self, async_client: AsyncClient, mock_service: MagicMock
    ) -> None:
        mock_service.get_all.return_value = []

        response = await async_client.get("/api/v1/todos")

        assert response.status_code == 200
        body = response.json()
        assert body["isSuccess"] is True
        assert body["data"] == []

    async def test_list_todos_returns_200_with_todo_list(
        self, async_client: AsyncClient, mock_service: MagicMock
    ) -> None:
        mock_service.get_all.return_value = [make_todo(id=1, title="Buy milk")]

        response = await async_client.get("/api/v1/todos")

        assert response.status_code == 200
        body = response.json()
        assert body["isSuccess"] is True
        assert len(body["data"]) == 1
        assert body["data"][0]["id"] == 1
        assert body["data"][0]["title"] == "Buy milk"
        assert body["data"][0]["isCompleted"] is False


class TestCreateTodo:
    async def test_create_todo_valid_payload_returns_201(
        self, async_client: AsyncClient, mock_service: MagicMock
    ) -> None:
        mock_service.create.return_value = make_todo(id=5, title="Write tests")

        response = await async_client.post(
            "/api/v1/todos", json={"title": "Write tests"}
        )

        assert response.status_code == 201
        body = response.json()
        assert body["isSuccess"] is True
        assert body["statusCode"] == 201
        assert body["data"]["id"] == 5
        assert body["data"]["title"] == "Write tests"

    async def test_create_todo_blank_title_returns_422(
        self, async_client: AsyncClient, mock_service: MagicMock
    ) -> None:
        response = await async_client.post("/api/v1/todos", json={"title": "   "})

        assert response.status_code == 422
        body = response.json()
        assert body["isSuccess"] is False
        assert len(body["errors"]) > 0

    async def test_create_todo_missing_title_returns_422(
        self, async_client: AsyncClient, mock_service: MagicMock
    ) -> None:
        response = await async_client.post("/api/v1/todos", json={})

        assert response.status_code == 422
        body = response.json()
        assert body["isSuccess"] is False

    async def test_create_todo_title_too_long_returns_422(
        self, async_client: AsyncClient, mock_service: MagicMock
    ) -> None:
        response = await async_client.post(
            "/api/v1/todos", json={"title": "x" * 256}
        )

        assert response.status_code == 422


class TestGetTodo:
    async def test_get_todo_existing_id_returns_200(
        self, async_client: AsyncClient, mock_service: MagicMock
    ) -> None:
        mock_service.get_by_id.return_value = make_todo(id=3, title="Read docs")

        response = await async_client.get("/api/v1/todos/3")

        assert response.status_code == 200
        body = response.json()
        assert body["isSuccess"] is True
        assert body["data"]["id"] == 3
        assert body["data"]["title"] == "Read docs"

    async def test_get_todo_missing_id_returns_404(
        self, async_client: AsyncClient, mock_service: MagicMock
    ) -> None:
        mock_service.get_by_id.side_effect = HTTPException(
            status_code=404, detail="Todo not found"
        )

        response = await async_client.get("/api/v1/todos/999")

        assert response.status_code == 404
        body = response.json()
        assert body["isSuccess"] is False
        assert "not found" in body["errors"][0].lower()


class TestUpdateTodo:
    async def test_update_todo_valid_payload_returns_200(
        self, async_client: AsyncClient, mock_service: MagicMock
    ) -> None:
        mock_service.update.return_value = make_todo(
            id=2, title="Updated", is_completed=True
        )

        response = await async_client.put(
            "/api/v1/todos/2", json={"title": "Updated", "isCompleted": True}
        )

        assert response.status_code == 200
        body = response.json()
        assert body["isSuccess"] is True
        assert body["data"]["title"] == "Updated"
        assert body["data"]["isCompleted"] is True

    async def test_update_todo_missing_id_returns_404(
        self, async_client: AsyncClient, mock_service: MagicMock
    ) -> None:
        mock_service.update.side_effect = HTTPException(
            status_code=404, detail="Todo not found"
        )

        response = await async_client.put(
            "/api/v1/todos/999", json={"title": "Ghost"}
        )

        assert response.status_code == 404
        body = response.json()
        assert body["isSuccess"] is False

    async def test_update_todo_blank_title_returns_422(
        self, async_client: AsyncClient, mock_service: MagicMock
    ) -> None:
        response = await async_client.put(
            "/api/v1/todos/1", json={"title": "   "}
        )

        assert response.status_code == 422


class TestDeleteTodo:
    async def test_delete_todo_existing_id_returns_200(
        self, async_client: AsyncClient, mock_service: MagicMock
    ) -> None:
        mock_service.delete.return_value = None

        response = await async_client.delete("/api/v1/todos/1")

        assert response.status_code == 200
        body = response.json()
        assert body["isSuccess"] is True
        assert body["data"] is None

    async def test_delete_todo_missing_id_returns_404(
        self, async_client: AsyncClient, mock_service: MagicMock
    ) -> None:
        mock_service.delete.side_effect = HTTPException(
            status_code=404, detail="Todo not found"
        )

        response = await async_client.delete("/api/v1/todos/999")

        assert response.status_code == 404
        body = response.json()
        assert body["isSuccess"] is False
        assert "not found" in body["errors"][0].lower()
