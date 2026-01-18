"""Item service using repository pattern."""

from src.models.item import Item, ItemCreate, ItemUpdate
from src.repositories.item_repository import ItemRepository


class ItemService:
    """Item service with repository-based data access."""

    def __init__(self, repository: ItemRepository) -> None:
        """Initialize service with repository."""
        self._repository = repository

    async def list_all(self) -> list[Item]:
        """Get all items."""
        return await self._repository.list_all()

    async def get_by_id(self, item_id: str) -> Item | None:
        """Get item by ID."""
        return await self._repository.get_by_id(item_id)

    async def create(self, data: ItemCreate) -> Item:
        """Create a new item."""
        return await self._repository.create(data)

    async def update(self, item_id: str, data: ItemUpdate) -> Item | None:
        """Update an existing item."""
        return await self._repository.update(item_id, data)

    async def delete(self, item_id: str) -> bool:
        """Delete an item."""
        return await self._repository.delete(item_id)
