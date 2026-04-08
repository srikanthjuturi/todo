from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.dependencies.category import get_category_service
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.response import ApiResponse, success
from app.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=ApiResponse[list[CategoryResponse]], status_code=status.HTTP_200_OK)
async def list_categories(
    service: Annotated[CategoryService, Depends(get_category_service)],
) -> ApiResponse[list[CategoryResponse]]:
    categories = await service.get_all()
    return success(categories)


@router.post("", response_model=ApiResponse[CategoryResponse], status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreate,
    service: Annotated[CategoryService, Depends(get_category_service)],
) -> ApiResponse[CategoryResponse]:
    category = await service.create(payload)
    return success(category, status_code=status.HTTP_201_CREATED)


@router.get("/{category_id}", response_model=ApiResponse[CategoryResponse], status_code=status.HTTP_200_OK)
async def get_category(
    category_id: int,
    service: Annotated[CategoryService, Depends(get_category_service)],
) -> ApiResponse[CategoryResponse]:
    category = await service.get_by_id(category_id)
    return success(category)


@router.put("/{category_id}", response_model=ApiResponse[CategoryResponse], status_code=status.HTTP_200_OK)
async def update_category(
    category_id: int,
    payload: CategoryUpdate,
    service: Annotated[CategoryService, Depends(get_category_service)],
) -> ApiResponse[CategoryResponse]:
    category = await service.update(category_id, payload)
    return success(category)


@router.delete("/{category_id}", response_model=ApiResponse[None], status_code=status.HTTP_200_OK)
async def delete_category(
    category_id: int,
    service: Annotated[CategoryService, Depends(get_category_service)],
) -> ApiResponse[None]:
    await service.delete(category_id)
    return success(None)
