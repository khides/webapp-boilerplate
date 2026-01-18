"""Application configuration."""

from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Server
    host: str = "0.0.0.0"
    port: int = 8080
    debug: bool = False

    # CORS - stored as comma-separated string, parsed via property
    cors_origins_str: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated CORS origins string."""
        return [
            origin.strip()
            for origin in self.cors_origins_str.split(",")
            if origin.strip()
        ]

    # Database
    database_url: str = "sqlite+aiosqlite:///./data/app.db"

    # Connection pool settings (MySQL only, ignored for SQLite)
    db_pool_size: int = 5
    db_pool_max_overflow: int = 10
    db_pool_recycle: int = 1800
    db_echo: bool = False

    @property
    def is_sqlite(self) -> bool:
        """Check if using SQLite database."""
        return self.database_url.startswith("sqlite")

    model_config = {
        "env_file": [".env", "../.env", "../../.env", "../../../.env"],
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
