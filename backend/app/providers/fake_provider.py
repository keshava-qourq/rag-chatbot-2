"""A deterministic fake AIProvider for local development and tests.

Selected with `AI_PROVIDER=fake`. It implements the same interface as
`OpenAIProvider` with no network calls and no SDK import, so a module written
against `AIProvider` works unchanged against it, and nothing here ever makes
a real API call by accident.
"""

from __future__ import annotations

import hashlib
from collections.abc import AsyncIterator
from typing import Any

from app.config import Settings
from app.providers.base import AIProvider

_EMBEDDING_DIMENSIONS = 8


class FakeProvider(AIProvider):
    """Returns deterministic, content-derived output -- never random."""

    def __init__(self, settings: Settings | None = None) -> None:
        # Accepts (and ignores) settings so the registry can construct every
        # provider the same way, `provider_cls(settings)`.
        self._settings = settings

    async def generate_stream(
        self, messages: list[dict[str, str]], **opts: Any
    ) -> AsyncIterator[str]:
        last_user = next(
            (m.get("content", "") for m in reversed(messages) if m.get("role") == "user"), ""
        )
        reply = f"[fake answer to: {last_user}]"
        for word in reply.split(" "):
            yield word + " "

    async def embed(self, texts: list[str]) -> list[list[float]]:
        return [self._embed_one(text) for text in texts]

    @staticmethod
    def _embed_one(text: str) -> list[float]:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        return [b / 255.0 for b in digest[:_EMBEDDING_DIMENSIONS]]
