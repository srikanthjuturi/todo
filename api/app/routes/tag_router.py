from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.dependencies.tag import get_tag_service
from app.schemas.response import ApiResponse, success
from app.schemas.tag import TagCreate, TagResponse, TagUpdate
from app.services.tag_service import TagService

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=ApiResponse[list[TagResponse]], status_code=status.HTTP_200_OK)
async def list_tags(
    service: Annotated[TagService, Depends(get_tag_service)],
) -> ApiResponse[list[TagResponse]]:
    tags = await service.get_all()
    return success(tags)


@router.post("", response_model=ApiResponse[TagResponse], status_code=status.HTTP_201_CREATED)
async def create_tag(
    payload: TagCreate,
    service: Annotated[TagService, Depends(get_tag_service)],
) -> ApiResponse[TagResponse]:
    tag = await service.create(payload)
    return success(tag, status_code=status.HTTP_201_CREATED)


@router.get("/{tag_id}", response_model=ApiResponse[TagResponse], status_code=status.HTTP_200_OK)
async def get_tag(
    tag_id: int,
    service: Annotated[TagService, Depends(get_tag_service)],
) -> ApiResponse[TagResponse]:
    tag = await service.get_by_id(tag_id)
    return success(tag)


@router.put("/{tag_id}", response_model=ApiResponse[TagResponse], status_code=status.HTTP_200_OK)
async def update_tag(
    tag_id: int,
    payload: TagUpdate,
    service: Annotated[TagService, Depends(get_tag_service)],
) -> ApiResponse[TagResponse]:
    tag = await service.update(tag_id, payload)
    return success(tag)


@router.delete("/{tag_id}", response_model=ApiResponse[None], status_code=status.HTTP_200_OK)
async def delete_tag(
    tag_id: int,
    service: Annotated[TagService, Depends(get_tag_service)],
) -> ApiResponse[None]:
    await service.delete(tag_id)
    return success(None)
