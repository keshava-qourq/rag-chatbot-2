"""AC-056, AC-057, AC-058: provider abstraction at the app-startup boundary.

`test_providers.py` already exercises `get_provider()` and the two
implementations directly. This file adds the checks that only make sense at
the edges of the abstraction: that the *running app* refuses to start when
misconfigured (not just the registry function in isolation), and that the
"only one file touches the SDK" guarantee holds over the whole `app` package,
not only `app/providers`. No test here makes a network call: `OpenAIProvider`
is never exercised past `__init__`, which only builds a client object.
"""

from __future__ import annotations

import ast
import pathlib

import pytest
from fastapi.testclient import TestClient

from app.config import ConfigurationError, get_settings
from app.main import app

APP_SOURCE_DIR = pathlib.Path(__file__).resolve().parent.parent / "app"
PROVIDERS_DIR = APP_SOURCE_DIR / "providers"


@pytest.fixture(autouse=True)
def _restore_settings_cache():
    """Each case here mutates the environment and the cached Settings
    singleton; reset both after so later tests see the real environment."""
    yield
    get_settings(refresh=True)


# AC-057 -----------------------------------------------------------------


def test_app_startup_fails_fast_without_openai_api_key(monkeypatch) -> None:
    """Given AI_PROVIDER=openai and no OPENAI_API_KEY, entering the app's
    startup lifespan raises ConfigurationError naming OPENAI_API_KEY, rather
    than starting the process and failing on the first chat request."""
    monkeypatch.setenv("AI_PROVIDER", "openai")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    get_settings(refresh=True)

    with pytest.raises(ConfigurationError, match="OPENAI_API_KEY"):
        with TestClient(app):
            pass


def test_app_startup_succeeds_with_openai_api_key_present(monkeypatch) -> None:
    """The same startup path does not raise once the key is present -- this
    is purely object construction, so no network call is made."""
    monkeypatch.setenv("AI_PROVIDER", "openai")
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")
    get_settings(refresh=True)

    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200


def test_app_startup_fails_fast_for_unknown_ai_provider(monkeypatch) -> None:
    """An unknown AI_PROVIDER also aborts startup, naming the known choices."""
    monkeypatch.setenv("AI_PROVIDER", "not-a-real-provider")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    get_settings(refresh=True)

    with pytest.raises(ConfigurationError, match="openai"):
        with TestClient(app):
            pass


# AC-056 -------------------------------------------------------------------


def _iter_app_source_files() -> list[pathlib.Path]:
    return list(APP_SOURCE_DIR.rglob("*.py"))


def test_openai_sdk_is_imported_only_in_openai_provider_module() -> None:
    """Scans every module under backend/app, not just app/providers: `openai`
    is reachable from exactly one file in the whole application."""
    importers = []
    for path in _iter_app_source_files():
        tree = ast.parse(path.read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom) and node.module and (
                node.module == "openai" or node.module.startswith("openai.")
            ):
                importers.append(path)
            if isinstance(node, ast.Import) and any(
                alias.name == "openai" or alias.name.startswith("openai.")
                for alias in node.names
            ):
                importers.append(path)

    assert importers == [PROVIDERS_DIR / "openai_provider.py"]


def test_no_module_outside_providers_instantiates_a_vendor_client() -> None:
    """Nothing outside app/providers calls `OpenAI(...)` or `AsyncOpenAI(...)`
    -- a consumer that needs generation or embeddings goes through
    `get_provider()`, never a vendor SDK constructor, directly."""
    vendor_ctor_names = {"OpenAI", "AsyncOpenAI"}
    offenders = []
    for path in _iter_app_source_files():
        if PROVIDERS_DIR in path.parents:
            continue
        tree = ast.parse(path.read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                func = node.func
                name = getattr(func, "id", None) or getattr(func, "attr", None)
                if name in vendor_ctor_names:
                    offenders.append(path)

    assert offenders == []
