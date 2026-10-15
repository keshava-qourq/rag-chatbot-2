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
    monkeypatch.delenv("ALLOWED_EMAIL_DOMAIN", raising=False)
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


def test_promoted_user_can_then_call_get_users(monkeypatch) -> None:
    """AC-007: once PATCH /users/{id}/role persists, the promoted user's own
    session -- not just a fresh admin session -- is now authorised for
    GET /users, since authorisation is re-derived from the row on every
    request rather than cached on the session at sign-in time."""
    admin_client = _signed_in_client(monkeypatch, "admin1b@example.com", "Admin")
    employee_client = _signed_in_client(monkeypatch, "employee1b@example.com", "Employee")
    employee_id = employee_client.get("/me").json()["id"]

    forbidden_before = employee_client.get("/users")
    assert forbidden_before.status_code == 403

    patch_response = admin_client.patch(f"/users/{employee_id}/role", json={"role": "admin"})
    assert patch_response.status_code == 200

    me_after = employee_client.get("/me")
    assert me_after.status_code == 200
    assert me_after.json()["role"] == "admin"

    list_after = employee_client.get("/users")
    assert list_after.status_code == 200
    assert {row["email"] for row in list_after.json()} == {
        "admin1b@example.com",
        "employee1b@example.com",
    }


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


def test_promote_rejects_unknown_role_value_and_leaves_role_unchanged(monkeypatch) -> None:
    """AC-008's "no document data is changed" guarantee only means something if a
    malformed role request is rejected rather than silently coerced -- `role` is
    a `Literal["admin", "employee"]` in `app/schemas.py`, so anything else must
    fail validation before it ever reaches the row."""
    admin_client = _signed_in_client(monkeypatch, "admin3@example.com", "Admin")
    employee_client = _signed_in_client(monkeypatch, "employee3@example.com", "Employee")
    employee_id = employee_client.get("/me").json()["id"]

    response = admin_client.patch(f"/users/{employee_id}/role", json={"role": "owner"})

    assert response.status_code == 422
    assert employee_client.get("/me").json()["role"] == "employee"


def test_promote_unknown_user_id_returns_404(monkeypatch) -> None:
    admin_client = _signed_in_client(monkeypatch, "admin4@example.com", "Admin")

    response = admin_client.patch("/users/999999/role", json={"role": "admin"})

    assert response.status_code == 404


def test_employee_promoting_unknown_user_id_is_403_not_404(monkeypatch) -> None:
    """AC-008: the admin guard runs before the row lookup, so an employee
    aimed at a nonexistent id is still turned away as unauthorised (403),
    never given a 404 that would leak whether that id exists."""
    monkeypatch.delenv("ALLOWED_EMAIL_DOMAIN", raising=False)
    employee_client = _signed_in_client(monkeypatch, "employee5@example.com", "Employee")

    response = employee_client.patch("/users/999999/role", json={"role": "admin"})

    assert response.status_code == 403


def test_patch_role_unauthenticated_returns_401(monkeypatch) -> None:
    """The promote action itself -- not just the list -- is refused with no
    session at all, the same way GET /me and GET /users already are."""
    monkeypatch.delenv("ALLOWED_EMAIL_DOMAIN", raising=False)
    client = TestClient(app)

    response = client.patch("/users/1/role", json={"role": "admin"})

    assert response.status_code == 401
