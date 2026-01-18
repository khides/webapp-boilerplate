"""Item SQLAlchemy model."""

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ItemModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Item database model."""

    __tablename__ = "items"

    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)

    def __repr__(self) -> str:
        return f"<Item(id={self.id}, title={self.title})>"
