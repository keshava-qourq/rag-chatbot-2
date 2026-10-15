"""Typed application settings loaded from environment variables.

One module the rest of the backend imports for every externally configured
value -- the AI provider's credentials, the database and queue URLs, AWS and
Google OAuth placeholders -- so a variable is named once here rather than
scattered across `os.getenv` calls in a dozen files.

The field names read from the environment here are deliberately the exact
service-key names the product owner is told to set before deployment
(`AWS_ACCESS_KEY_ID`, `AWS_REGION`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OPENAI_API_KEY`) -- a module that
invents its own name for a secret the product owner was told to set under a
different one would never see it.
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
    aws_region: str | None
    aws_access_key_id: str | None
    aws_secret_access_key: str | None
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
        aws_region=os.getenv("AWS_REGION") or None,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID") or None,
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY") or None,
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
