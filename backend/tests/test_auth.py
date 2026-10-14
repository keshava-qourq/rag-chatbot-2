"""Tests for Google SSO, session handling, the allow-list and bootstrap admin.

Google itself is never contacted: `app.auth.get_oauth` is monkeypatched to a
fake client whose `authorize_redirect` / `authorize_access_token` are async
mocks, so these exercise the app's own logic (allow-list, user matching,
first-account-becomes-admin, session cookie) with no network call.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient
from starlette.responses import RedirectResponse

from app import auth as auth_module
from app.database import Base, SessionLocal, engine
from app.main import app
from app.models import User


@pytest.fixture(autouse=True)
def _clean_users_table():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    db.query(User).delete()
    db.commit()
    db.close()
    yield


@pytest.fixture
def client():
    return TestClient(app)


def _fake_oauth(email: str | None = "alice@example.com", name: str = "Alice") -> MagicMock:
    oauth = MagicMock()
    oauth.google.authorize_redirect = AsyncMock(
        return_value=RedirectResponse(url="https://accounts.google.com/o/oauth2/fake-auth")
    )
    userinfo = {} if email is None else {"email": email, "name": name}
    oauth.google.authorize_access_token = AsyncMock(return_value={"userinfo": userinfo})
    return oauth


def test_login_redirects_to_google(client, monkeypatch) -> None:
    monkeypatch.setattr(auth_module, "get_oauth", lambda: _fake_oauth())

    response = client.get("/auth/login", follow_redirects=False)

    assert response.status_code in (302, 307)
    assert "accounts.google.com" in response.headers["location"]


def test_callback_creates_user_sets_session_and_redirects(client, monkeypatch) -> None:
    monkeypatch.delenv("ALLOWED_EMAIL_DOMAINS", raising=False)
    monkeypatch.setattr(auth_module, "get_oauth", lambda: _fake_oauth("alice@example.com", "Alice"))

    response = client.get("/auth/callback", follow_redirects=False)

    assert response.status_code in (302, 307)
    assert response.cookies.get("session") is not None

    me_response = client.get("/me")
    assert me_response.status_code == 200
    body = me_response.json()
    assert body["email"] == "alice@example.com"
    assert body["name"] == "Alice"


def test_first_account_becomes_admin_subsequent_become_employee(client, monkeypatch) -> None:
    monkeypatch.delenv("ALLOWED_EMAIL_DOMAINS", raising=False)

    monkeypatch.setattr(auth_module, "get_oauth", lambda: _fake_oauth("first@example.com", "First"))
    client.get("/auth/callback", follow_redirects=False)
    first_me = client.get("/me").json()
    assert first_me["role"] == "admin"

    other_client = TestClient(app)
    monkeypatch.setattr(auth_module, "get_oauth", lambda: _fake_oauth("second@example.com", "Second"))
    other_client.get("/auth/callback", follow_redirects=False)
    second_me = other_client.get("/me").json()
    assert second_me["role"] == "employee"


def test_callback_rejects_email_outside_allow_list(client, monkeypatch) -> None:
    monkeypatch.setenv("ALLOWED_EMAIL_DOMAINS", "corp.example.com")
    monkeypatch.setattr(
        auth_module, "get_oauth", lambda: _fake_oauth("outsider@gmail.com", "Outsider")
    )

    response = client.get("/auth/callback", follow_redirects=False)

    assert response.status_code == 403
    assert response.json()["detail"] == "access is limited to company accounts"
    assert response.cookies.get("session") is None

    db = SessionLocal()
    try:
        assert db.query(User).filter(User.email == "outsider@gmail.com").first() is None
    finally:
        db.close()

    me_response = client.get("/me")
    assert me_response.status_code == 401


def test_logout_invalidates_session(client, monkeypatch) -> None:
    monkeypatch.delenv("ALLOWED_EMAIL_DOMAINS", raising=False)
    monkeypatch.setattr(auth_module, "get_oauth", lambda: _fake_oauth("bob@example.com", "Bob"))
    client.get("/auth/callback", follow_redirects=False)
    assert client.get("/me").status_code == 200

    logout_response = client.post("/auth/logout")
    assert logout_response.status_code == 200

    assert client.get("/me").status_code == 401
    assert client.get("/users").status_code == 401


def test_unauthenticated_requests_return_401_with_no_body_leak(client) -> None:
    for path in ("/me", "/users"):
        response = client.get(path)
        assert response.status_code == 401
        assert "role" not in response.text
        assert "email" not in response.text
