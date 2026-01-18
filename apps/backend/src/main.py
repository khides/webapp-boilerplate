"""FastAPI application entry point."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import health, items
from src.config import get_settings
from src.db.session import close_db, init_db
from src.version import VERSION


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler for startup/shutdown."""
    settings = get_settings()
    # TODO: アプリケーション名に変更
    print(f"Starting webapp-backend v{VERSION} (debug={settings.debug})")

    # Initialize database
    await init_db()
    print(f"Database initialized: {settings.database_url}")

    yield

    # Cleanup database connections
    await close_db()
    print("Database connection closed")
    print("Shutting down...")


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        # TODO: APIタイトルに変更
        title="Webapp API",
        # TODO: APIの説明に変更
        description="Backend API for Webapp Boilerplate",
        version=VERSION,
        lifespan=lifespan,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type"],
    )

    # Include routers
    app.include_router(health.router, tags=["health"])
    app.include_router(items.router, prefix="/v1", tags=["items"])

    return app


app = create_app()
