"""Health check endpoint."""

from fastapi import APIRouter

from src.version import VERSION

router = APIRouter()


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "version": VERSION}
