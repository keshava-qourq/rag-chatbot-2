"""The default AIProvider implementation, backed by the OpenAI SDK.

This is the only file in the codebase that imports `openai`. The registry and
every consumer import only `app.providers.AIProvider`, so swapping the SDK,
or testing against `app.providers.fake_provider.FakeProvider`, never touches
them.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Any

from openai import AsyncOpenAI

from app.config import ConfigurationError, Settings
from app.providers.base import AIProvider

DEFAULT_CHAT_MODEL = "gpt-4o-mini"
DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small"


class OpenAIProvider(AIProvider):
    """Generation and embeddings via the OpenAI API."""

    def __init__(self, settings: Settings) -> None:
        if not settings.openai_api_key:
            raise ConfigurationError(
                "OPENAI_API_KEY is not set, but AI_PROVIDER=openai is selected. "
                "Set OPENAI_API_KEY, or choose a different AI_PROVIDER, before starting the app."
            )
        self._client = AsyncOpenAI(api_key=settings.openai_api_key)
        self._chat_model = DEFAULT_CHAT_MODEL
        self._embedding_model = DEFAULT_EMBEDDING_MODEL

    async def generate_stream(
        self, messages: list[dict[str, str]], **opts: Any
    ) -> AsyncIterator[str]:
        model = opts.pop("model", self._chat_model)
        stream = await self._client.chat.completions.create(
            model=model, messages=messages, stream=True, **opts
        )
        async for chunk in stream:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    async def embed(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        response = await self._client.embeddings.create(model=self._embedding_model, input=texts)
        return [item.embedding for item in response.data]
