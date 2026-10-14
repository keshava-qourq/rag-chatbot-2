"""The one internal interface every AI provider implements.

Chat and ingestion modules import only this module (and `get_provider` from
`app.providers`), never an SDK directly. That is what lets the OpenAI
implementation, or the deterministic fake used in tests, be swapped by an
environment variable with no change to a consumer.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from typing import Any


class AIProvider(ABC):
    """Generation and embeddings behind one interface, not two parallel ones."""

    @abstractmethod
    def generate_stream(self, messages: list[dict[str, str]], **opts: Any) -> AsyncIterator[str]:
        """Stream an answer as it is generated, one text chunk at a time.

        `messages` is the OpenAI-style chat history: a list of
        `{"role": ..., "content": ...}` dicts. Implementations are async
        generator functions; calling one returns the `AsyncIterator[str]`
        without doing any work until it is iterated.
        """

    @abstractmethod
    async def embed(self, texts: list[str]) -> list[list[float]]:
        """Embed each text, returning one vector per input in the same order."""
