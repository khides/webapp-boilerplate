"""Item repository implementation."""

from uuid import uuid4

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.item import ItemModel
from src.models.item import Item, ItemCreate, ItemUpdate


class ItemRepository:
    """Repository for Item entities."""

    def __init__(self, session: AsyncSession) -> None:
        """Initialize repository with database session."""
        self._session = session

    async def list_all(self) -> list[Item]:
        """Get all items."""
        result = await self._session.execute(select(ItemModel))
        models = result.scalars().all()
        return [Item.model_validate(m) for m in models]

    async def get_by_id(self, item_id: str) -> Item | None:
        """Get item by ID."""
        result = await self._session.execute(
            select(ItemModel).where(ItemModel.id == item_id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return Item.model_validate(model)

    async def create(self, data: ItemCreate) -> Item:
        """Create a new item."""
        model = ItemModel(
            id=str(uuid4()),
            title=data.title,
            description=data.description,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return Item.model_validate(model)

    async def update(self, item_id: str, data: ItemUpdate) -> Item | None:
        """Update an existing item."""
        result = await self._session.execute(
            select(ItemModel).where(ItemModel.id == item_id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(model, key, value)

        await self._session.flush()
        await self._session.refresh(model)
        return Item.model_validate(model)

    async def delete(self, item_id: str) -> bool:
        """Delete an item."""
        result = await self._session.execute(
            delete(ItemModel).where(ItemModel.id == item_id)
        )
        return result.rowcount > 0
