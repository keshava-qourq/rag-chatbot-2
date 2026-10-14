"""The internal AI provider interface: the one module chat and ingestion import.

`AIProvider` names the contract (`generate_stream`, `embed`); `get_provider`
resolves the implementation selected by `AI_PROVIDER`. Nothing outside
`app/providers/openai_provider.py` should ever import the `openai` SDK.
"""

from app.providers.base import AIProvider
from app.providers.registry import get_provider

__all__ = ["AIProvider", "get_provider"]
