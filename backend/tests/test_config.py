"""Tests for the shared settings module."""

from app.config import ConfigurationError, Settings, get_settings, load_settings


def test_defaults_when_env_unset(monkeypatch) -> None:
    for var in (
        "AI_PROVIDER",
        "OPENAI_API_KEY",
        "DATABASE_URL",
        "REDIS_URL",
        "S3_BUCKET",
        "AWS_REGION",
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "GOOGLE_CLIENT_ID",
    ):
        monkeypatch.delenv(var, raising=False)

    settings = load_settings()

    assert settings.ai_provider == "openai"
    assert settings.openai_api_key is None
    assert settings.database_url == "sqlite:///./app.db"
    assert settings.redis_url == "redis://localhost:6379/0"
    assert settings.s3_bucket is None
    assert settings.aws_region is None
    assert settings.aws_access_key_id is None
    assert settings.aws_secret_access_key is None
    assert settings.google_client_id is None


def test_reads_every_declared_variable(monkeypatch) -> None:
    monkeypatch.setenv("AI_PROVIDER", "Fake")
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://x")
    monkeypatch.setenv("REDIS_URL", "redis://x:6379/0")
    monkeypatch.setenv("S3_BUCKET", "bucket")
    monkeypatch.setenv("AWS_REGION", "us-east-1")
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "key")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "secret")
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "client-id")
    monkeypatch.setenv("GOOGLE_CLIENT_SECRET", "client-secret")
    monkeypatch.setenv("GOOGLE_REDIRECT_URI", "https://example.com/callback")

    settings = load_settings()

    assert settings.ai_provider == "fake"  # normalised to lowercase
    assert settings.openai_api_key == "sk-test"
    assert settings.database_url == "postgresql+psycopg://x"
    assert settings.redis_url == "redis://x:6379/0"
    assert settings.s3_bucket == "bucket"
    assert settings.aws_region == "us-east-1"
    assert settings.aws_access_key_id == "key"
    assert settings.aws_secret_access_key == "secret"
    assert settings.google_client_id == "client-id"
    assert settings.google_client_secret == "client-secret"
    assert settings.google_redirect_uri == "https://example.com/callback"


def test_get_settings_is_cached_until_refreshed(monkeypatch) -> None:
    monkeypatch.setenv("AI_PROVIDER", "openai")
    first = get_settings(refresh=True)
    monkeypatch.setenv("AI_PROVIDER", "fake")

    assert get_settings().ai_provider == first.ai_provider == "openai"
    assert get_settings(refresh=True).ai_provider == "fake"


def test_configuration_error_is_a_plain_runtime_error() -> None:
    assert issubclass(ConfigurationError, RuntimeError)


def test_settings_is_frozen() -> None:
    settings = Settings(
        ai_provider="openai",
        openai_api_key=None,
        database_url="sqlite:///./app.db",
        redis_url="redis://localhost:6379/0",
        s3_bucket=None,
        aws_region=None,
        aws_access_key_id=None,
        aws_secret_access_key=None,
        google_client_id=None,
        google_client_secret=None,
        google_redirect_uri=None,
    )
    try:
        settings.ai_provider = "fake"  # type: ignore[misc]
        raised = False
    except Exception:
        raised = True
    assert raised
