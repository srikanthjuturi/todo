from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from app.dependencies.todo import get_todo_service
from app.main import app
from app.models.category import Category
from app.models.tag import Tag
from app.models.todo import Todo
from app.services.todo_service import TodoService


def make_todo(
    id: int = 1,
    title: str = "Test todo",
    description: str | None = None,
    is_completed: bool = False,
) -> Todo:
    """Build a detached Todo ORM instance for use in unit tests."""
    todo = Todo(title=title, description=description, is_completed=is_completed)
    todo.id = id
    todo.created_at = datetime(2024, 1, 1, 12, 0, 0)
    todo.updated_at = datetime(2024, 1, 1, 12, 0, 0)
    return todo


def make_category(id: int = 1, name: str = "Work") -> Category:
    category = Category(name=name)
    category.id = id
    category.created_at = datetime(2024, 1, 1, 12, 0, 0)
    return category


def make_tag(id: int = 1, name: str = "Urgent") -> Tag:
    tag = Tag(name=name)
    tag.id = id
    tag.created_at = datetime(2024, 1, 1, 12, 0, 0)
    return tag


@pytest.fixture
def sample_todo() -> Todo:
    """Provide a single pre-built Todo fixture."""
    return make_todo()


@pytest.fixture
def sample_category() -> Category:
    """Provide a single pre-built Category fixture."""
    return make_category()


@pytest.fixture
def sample_tag() -> Tag:
    """Provide a single pre-built Tag fixture."""
    return make_tag()


@pytest.fixture
def mock_session() -> AsyncMock:
    """Provide a mocked AsyncSession with async stubs for all used methods."""
    session = AsyncMock()
    session.add = MagicMock()
    return session


@pytest.fixture
def mock_repository(mock_session: AsyncMock) -> MagicMock:
    """Provide a TodoRepository mock with all public methods pre-stubbed."""
    repo = MagicMock()
    repo.session = mock_session
    repo.get_all = AsyncMock()
    repo.get_by_id = AsyncMock()
    repo.create = AsyncMock()
    repo.update = AsyncMock()
    repo.delete = AsyncMock()
    return repo


@pytest.fixture
def mock_category_repository() -> MagicMock:
    """Provide a CategoryRepository mock with all public methods pre-stubbed."""
    repo = MagicMock()
    repo.get_all = AsyncMock()
    repo.get_by_id = AsyncMock()
    repo.get_by_name = AsyncMock()
    repo.create = AsyncMock()
    repo.update = AsyncMock()
    repo.delete = AsyncMock()
    repo.has_todos = AsyncMock()
    return repo


@pytest.fixture
def mock_tag_repository() -> MagicMock:
    """Provide a TagRepository mock with all public methods pre-stubbed."""
    repo = MagicMock()
    repo.get_all = AsyncMock()
    repo.get_by_id = AsyncMock()
    repo.get_by_name = AsyncMock()
    repo.create = AsyncMock()
    repo.update = AsyncMock()
    repo.delete = AsyncMock()
    return repo


@pytest.fixture
def mock_service() -> MagicMock:
    """Provide a TodoService mock with all public methods pre-stubbed."""
    service = MagicMock(spec=TodoService)
    service.get_all = AsyncMock()
    service.get_by_id = AsyncMock()
    service.create = AsyncMock()
    service.update = AsyncMock()
    service.delete = AsyncMock()
    return service


@pytest.fixture
async def async_client(mock_service: MagicMock) -> AsyncClient:
    """Provide an httpx AsyncClient backed by the FastAPI ASGI app.

    Overrides the get_todo_service DI dependency with a mock so that
    no real database is required during route-level tests.
    """
    app.dependency_overrides[get_todo_service] = lambda: mock_service
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client
    app.dependency_overrides.clear()
