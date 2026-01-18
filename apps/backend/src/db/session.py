"""Async database session management."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool, QueuePool

from src.config import get_settings

# Global engine and session factory
_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def _create_engine() -> AsyncEngine:
    """Create async SQLAlchemy engine with appropriate pooling."""
    settings = get_settings()

    # SQLite doesn't support connection pooling
    if settings.is_sqlite:
        return create_async_engine(
            settings.database_url,
            echo=settings.db_echo,
            poolclass=NullPool,
        )

    # MySQL with connection pooling
    return create_async_engine(
        settings.database_url,
        echo=settings.db_echo,
        poolclass=QueuePool,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_pool_max_overflow,
        pool_recycle=settings.db_pool_recycle,
        pool_pre_ping=True,
    )


async def init_db() -> None:
    """Initialize database engine and session factory."""
    global _engine, _session_factory

    _engine = _create_engine()
    _session_factory = async_sessionmaker(
        _engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )


async def close_db() -> None:
    """Close database connections."""
    global _engine, _session_factory

    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _session_factory = None


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Get async session for FastAPI dependency injection."""
    if _session_factory is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")

    async with _session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
