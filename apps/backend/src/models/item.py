"""Item models."""

from datetime import datetime

from pydantic import BaseModel, Field


class ItemBase(BaseModel):
    """Base item model with shared fields."""

    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=1000)


class ItemCreate(ItemBase):
    """Item creation request model."""

    pass


class ItemUpdate(BaseModel):
    """Item update request model."""

    title: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, max_length=1000)


class Item(ItemBase):
    """Item response model."""

    id: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }
