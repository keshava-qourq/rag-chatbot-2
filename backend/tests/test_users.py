"""Tests for GET /me, GET /users and PATCH /users/{id}/role."""

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


def _fake_oauth(email: str, name: str) -> MagicMock:
    oauth = MagicMock()
    oauth.google.authorize_redirect = AsyncMock(
        return_value=RedirectResponse(url="https://accounts.google.com/o/oauth2/fake-auth")
    )
    oauth.google.authorize_access_token = AsyncMock(
        return_value={"userinfo": {"email": email, "name": name}}
    )
    return oauth


def _signed_in_client(monkeypatch, email: str, name: str) -> TestClient:
    monkeypatch.delenv("ALLOWED_EMAIL_DOMAINS", raising=False)
    monkeypatch.setattr(auth_module, "get_oauth", lambda: _fake_oauth(email, name))
    client = TestClient(app)
    client.get("/auth/callback", follow_redirects=False)
    return client


def test_admin_can_list_users_and_change_role(monkeypatch) -> None:
    admin_client = _signed_in_client(monkeypatch, "admin@example.com", "Admin")
    employee_client = _signed_in_client(monkeypatch, "employee@example.com", "Employee")
    employee_id = employee_client.get("/me").json()["id"]

    list_response = admin_client.get("/users")
    assert list_response.status_code == 200
    rows = list_response.json()
    assert {row["email"] for row in rows} == {"admin@example.com", "employee@example.com"}
    assert all({"id", "email", "name", "role", "created_at"} <= set(row) for row in rows)

    patch_response = admin_client.patch(f"/users/{employee_id}/role", json={"role": "admin"})
    assert patch_response.status_code == 200
    assert patch_response.json()["role"] == "admin"

    assert employee_client.get("/me").json()["role"] == "admin"


def test_employee_cannot_list_users_or_change_roles(monkeypatch) -> None:
    admin_client = _signed_in_client(monkeypatch, "admin2@example.com", "Admin")
    employee_client = _signed_in_client(monkeypatch, "employee2@example.com", "Employee")
    admin_id = admin_client.get("/me").json()["id"]

    list_response = employee_client.get("/users")
    assert list_response.status_code == 403

    patch_response = employee_client.patch(f"/users/{admin_id}/role", json={"role": "employee"})
    assert patch_response.status_code == 403

    db = SessionLocal()
    try:
        admin_row = db.get(User, admin_id)
        assert admin_row.role == "admin"
    finally:
        db.close()


def test_me_returns_expected_shape(monkeypatch) -> None:
    client = _signed_in_client(monkeypatch, "shape@example.com", "Shape")

    response = client.get("/me")

    assert response.status_code == 200
    assert set(response.json()) == {"id", "email", "name", "role"}
