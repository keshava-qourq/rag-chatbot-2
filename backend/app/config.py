"""Typed application settings loaded from environment variables.

One module the rest of the backend imports for every externally configured
value -- the AI provider's credentials, the database and queue URLs, S3 and
Google OAuth placeholders -- so a variable is named once here rather than
scattered across `os.getenv` calls in a dozen files.
"""

from __future__ import annotations

import os
from dataclasses import dataclass


class ConfigurationError(RuntimeError):
    """Raised when a required setting is missing or invalid at startup.

    Deliberately a plain exception rather than a silent fallback: the
    provider registry raises this by name (e.g. naming OPENAI_API_KEY) so the
    process refuses to start rather than answering requests with a provider
    that was never configured.
    """


@dataclass(frozen=True)
class Settings:
    """A snapshot of the environment at the moment it was loaded."""

    ai_provider: str
    openai_api_key: str | None
    database_url: str
    redis_url: str
    s3_bucket: str | None
    s3_region: str | None
    s3_access_key_id: str | None
    s3_secret_access_key: str | None
    google_client_id: str | None
    google_client_secret: str | None
    google_redirect_uri: str | None


def load_settings() -> Settings:
    """Read settings fresh from the environment."""
    return Settings(
        ai_provider=(os.getenv("AI_PROVIDER", "openai").strip().lower() or "openai"),
        openai_api_key=os.getenv("OPENAI_API_KEY") or None,
        database_url=os.getenv("DATABASE_URL", "sqlite:///./app.db"),
        redis_url=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
        s3_bucket=os.getenv("S3_BUCKET") or None,
        s3_region=os.getenv("S3_REGION") or None,
        s3_access_key_id=os.getenv("S3_ACCESS_KEY_ID") or None,
        s3_secret_access_key=os.getenv("S3_SECRET_ACCESS_KEY") or None,
        google_client_id=os.getenv("GOOGLE_CLIENT_ID") or None,
        google_client_secret=os.getenv("GOOGLE_CLIENT_SECRET") or None,
        google_redirect_uri=os.getenv("GOOGLE_REDIRECT_URI") or None,
    )


_settings: Settings | None = None


def get_settings(*, refresh: bool = False) -> Settings:
    """A cached settings snapshot.

    `refresh=True` re-reads the environment -- tests that change `os.environ`
    between cases need it; application code never should, since settings are
    read once at process startup.
    """
    global _settings
    if _settings is None or refresh:
        _settings = load_settings()
    return _settings
