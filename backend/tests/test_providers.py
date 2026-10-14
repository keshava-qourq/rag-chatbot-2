"""Tests for the internal AIProvider interface, registry and implementations.

No pytest-asyncio plugin is installed, so async behaviour is driven with
`asyncio.run` from ordinary synchronous test functions.
"""

import asyncio

import pytest

from app.config import ConfigurationError, Settings
from app.providers import AIProvider, get_provider
from app.providers.fake_provider import FakeProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.registry import _PROVIDERS


def _settings(**overrides: object) -> Settings:
    base = dict(
        ai_provider="openai",
        openai_api_key=None,
        database_url="sqlite:///./app.db",
        redis_url="redis://localhost:6379/0",
        s3_bucket=None,
        s3_region=None,
        s3_access_key_id=None,
        s3_secret_access_key=None,
        google_client_id=None,
        google_client_secret=None,
        google_redirect_uri=None,
    )
    base.update(overrides)
    return Settings(**base)


def test_registry_defaults_to_openai() -> None:
    assert _PROVIDERS["openai"] is OpenAIProvider


def test_registry_resolves_fake_without_an_api_key() -> None:
    provider = get_provider(_settings(ai_provider="fake"))

    assert isinstance(provider, FakeProvider)
    assert isinstance(provider, AIProvider)


def test_registry_raises_configuration_error_naming_the_missing_key() -> None:
    with pytest.raises(ConfigurationError, match="OPENAI_API_KEY"):
        get_provider(_settings(ai_provider="openai", openai_api_key=None))


def test_registry_builds_openai_provider_when_key_present() -> None:
    provider = get_provider(_settings(ai_provider="openai", openai_api_key="sk-test"))

    assert isinstance(provider, OpenAIProvider)


def test_registry_raises_configuration_error_for_unknown_provider() -> None:
    with pytest.raises(ConfigurationError, match="nonexistent"):
        get_provider(_settings(ai_provider="nonexistent"))


def test_openai_sdk_is_imported_in_exactly_one_module() -> None:
    """Guards AC-056: no second file reaches for the OpenAI SDK directly."""
    import ast
    import pathlib

    providers_dir = pathlib.Path(__file__).resolve().parent.parent / "app" / "providers"
    importers = []
    for path in providers_dir.glob("*.py"):
        tree = ast.parse(path.read_text())
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom) and node.module and node.module.startswith(
                "openai"
            ):
                importers.append(path.name)
            if isinstance(node, ast.Import) and any(
                alias.name.startswith("openai") for alias in node.names
            ):
                importers.append(path.name)

    assert importers == ["openai_provider.py"]


def test_fake_provider_generate_stream_yields_text() -> None:
    async def _run() -> list[str]:
        provider = FakeProvider()
        messages = [{"role": "user", "content": "hello"}]
        return [chunk async for chunk in provider.generate_stream(messages)]

    chunks = asyncio.run(_run())

    assert chunks
    assert all(isinstance(chunk, str) for chunk in chunks)
    assert "hello" in "".join(chunks)


def test_fake_provider_embed_is_deterministic_and_shaped() -> None:
    async def _run() -> tuple[list[list[float]], list[list[float]], list[list[float]]]:
        provider = FakeProvider()
        first = await provider.embed(["same text"])
        second = await provider.embed(["same text"])
        different = await provider.embed(["other text"])
        return first, second, different

    first, second, different = asyncio.run(_run())

    assert first == second
    assert first != different
    assert len(first) == 1
    assert all(isinstance(v, float) for v in first[0])


def test_fake_provider_embed_empty_list() -> None:
    async def _run() -> list[list[float]]:
        return await FakeProvider().embed([])

    assert asyncio.run(_run()) == []
