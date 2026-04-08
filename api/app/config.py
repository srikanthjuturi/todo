import logging
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

# Resolve .env relative to this file's location (api/.env) regardless of cwd
_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    """Application configuration loaded from environment variables.

    Attributes:
        database_url: Async SQLAlchemy connection string for SQL Server via aioodbc.
    """

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        case_sensitive=False,
    )

    database_url: str


settings = Settings()
