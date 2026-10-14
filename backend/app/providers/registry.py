"""Resolves the active AIProvider from `settings.AI_PROVIDER`.

Chat and ingestion modules call `get_provider()` and never import an SDK, or
a concrete provider class, directly. Adding a third implementation means
registering its class here; nothing else changes.
"""

from __future__ import annotations

from app.config import ConfigurationError, Settings, get_settings
from app.providers.base import AIProvider
from app.providers.fake_provider import FakeProvider
from app.providers.openai_provider import OpenAIProvider

_PROVIDERS: dict[str, type[AIProvider]] = {
    "openai": OpenAIProvider,
    "fake": FakeProvider,
}


def get_provider(settings: Settings | None = None) -> AIProvider:
    """Instantiate the provider named by AI_PROVIDER, failing fast if misconfigured.

    Raises `ConfigurationError` -- naming the missing variable -- rather than
    falling back to any other provider or answer path.
    """
    settings = settings or get_settings()
    provider_cls = _PROVIDERS.get(settings.ai_provider)
    if provider_cls is None:
        known = ", ".join(sorted(_PROVIDERS))
        raise ConfigurationError(
            f"Unknown AI_PROVIDER={settings.ai_provider!r}. Expected one of: {known}."
        )
    return provider_cls(settings)
