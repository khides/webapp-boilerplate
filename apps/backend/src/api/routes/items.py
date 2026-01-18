"""Item CRUD endpoints with dependency injection."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_session
from src.models.item import Item, ItemCreate, ItemUpdate
from src.repositories.item_repository import ItemRepository
from src.services.item_service import ItemService

router = APIRouter(prefix="/items")


def get_item_service(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> ItemService:
    """Dependency to get ItemService with injected repository."""
    repository = ItemRepository(session)
    return ItemService(repository)


@router.get("", response_model=list[Item])
async def list_items(
    service: Annotated[ItemService, Depends(get_item_service)],
) -> list[Item]:
    """Get all items."""
    return await service.list_all()


@router.get("/{item_id}", response_model=Item)
async def get_item(
    item_id: str,
    service: Annotated[ItemService, Depends(get_item_service)],
) -> Item:
    """Get item by ID."""
    item = await service.get_by_id(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("", response_model=Item, status_code=201)
async def create_item(
    data: ItemCreate,
    service: Annotated[ItemService, Depends(get_item_service)],
) -> Item:
    """Create a new item."""
    return await service.create(data)


@router.put("/{item_id}", response_model=Item)
async def update_item(
    item_id: str,
    data: ItemUpdate,
    service: Annotated[ItemService, Depends(get_item_service)],
) -> Item:
    """Update an existing item."""
    item = await service.update(item_id, data)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.delete("/{item_id}", status_code=204)
async def delete_item(
    item_id: str,
    service: Annotated[ItemService, Depends(get_item_service)],
) -> None:
    """Delete an item."""
    success = await service.delete(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
