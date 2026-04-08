from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.dependencies.todo import get_todo_service
from app.schemas.response import ApiResponse, success
from app.schemas.todo import TodoCreate, TodoResponse, TodoUpdate
from app.services.todo_service import TodoService

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get(
    "",
    response_model=ApiResponse[list[TodoResponse]],
    status_code=status.HTTP_200_OK,
)
async def list_todos(
    service: Annotated[TodoService, Depends(get_todo_service)],
) -> ApiResponse[list[TodoResponse]]:
    """Return all todos ordered by creation date descending.

    Args:
        service: TodoService injected by FastAPI.

    Returns:
        ApiResponse wrapping a list of TodoResponse objects.
    """
    todos = await service.get_all()
    return success(todos)


@router.post(
    "",
    response_model=ApiResponse[TodoResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_todo(
    payload: TodoCreate,
    service: Annotated[TodoService, Depends(get_todo_service)],
) -> ApiResponse[TodoResponse]:
    """Create a new todo.

    Args:
        payload: Validated TodoCreate request body.
        service: TodoService injected by FastAPI.

    Returns:
        ApiResponse wrapping the created TodoResponse with status 201.
    """
    todo = await service.create(payload)
    return success(todo, status_code=status.HTTP_201_CREATED)


@router.get(
    "/{todo_id}",
    response_model=ApiResponse[TodoResponse],
    status_code=status.HTTP_200_OK,
)
async def get_todo(
    todo_id: int,
    service: Annotated[TodoService, Depends(get_todo_service)],
) -> ApiResponse[TodoResponse]:
    """Return a single todo by id.

    Args:
        todo_id: Primary key of the todo.
        service: TodoService injected by FastAPI.

    Returns:
        ApiResponse wrapping the matching TodoResponse.

    Raises:
        HTTPException: 404 if not found.
    """
    todo = await service.get_by_id(todo_id)
    return success(todo)


@router.put(
    "/{todo_id}",
    response_model=ApiResponse[TodoResponse],
    status_code=status.HTTP_200_OK,
)
async def update_todo(
    todo_id: int,
    payload: TodoUpdate,
    service: Annotated[TodoService, Depends(get_todo_service)],
) -> ApiResponse[TodoResponse]:
    """Update an existing todo.

    Args:
        todo_id: Primary key of the todo to update.
        payload: Validated TodoUpdate request body.
        service: TodoService injected by FastAPI.

    Returns:
        ApiResponse wrapping the updated TodoResponse.

    Raises:
        HTTPException: 404 if not found.
    """
    todo = await service.update(todo_id, payload)
    return success(todo)


@router.delete(
    "/{todo_id}",
    response_model=ApiResponse[None],
    status_code=status.HTTP_200_OK,
)
async def delete_todo(
    todo_id: int,
    service: Annotated[TodoService, Depends(get_todo_service)],
) -> ApiResponse[None]:
    """Delete a todo by id.

    Args:
        todo_id: Primary key of the todo to delete.
        service: TodoService injected by FastAPI.

    Returns:
        ApiResponse with data=None confirming deletion.

    Raises:
        HTTPException: 404 if not found.
    """
    await service.delete(todo_id)
    return success(None)
