"""Tests for GET /me, GET /users and PATCH /users/{id}/role."""

import threading
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Query
from sqlalchemy.orm import Session as OrmSession
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


# AC-067/068/069/070: the last-admin and self-role guard on the PATCH itself.
# ---------------------------------------------------------------------------

ADMIN_MUST_REMAIN_DETAIL = "At least one admin must remain"


@pytest.mark.parametrize("requested_role", ["admin", "employee"])
def test_self_role_change_always_409s_and_leaves_role_unchanged(monkeypatch, requested_role) -> None:
    """AC-067: an admin patching their own id is refused with 409 regardless
    of which role was requested, and the row in the database is unchanged."""
    admin_client = _signed_in_client(monkeypatch, "self-guard@example.com", "SelfGuard")
    admin_id = admin_client.get("/me").json()["id"]

    response = admin_client.patch(f"/users/{admin_id}/role", json={"role": requested_role})

    assert response.status_code == 409
    assert response.json()["detail"] == ADMIN_MUST_REMAIN_DETAIL

    db = SessionLocal()
    try:
        row = db.get(User, admin_id)
        assert row.role == "admin"
    finally:
        db.close()


def test_sole_admin_self_demotion_returns_409_and_admin_count_stays_one(monkeypatch) -> None:
    """AC-068: with exactly one admin, self-demotion to employee returns 409
    and the admin headcount is still one afterwards."""
    admin_client = _signed_in_client(monkeypatch, "sole-admin@example.com", "SoleAdmin")
    admin_id = admin_client.get("/me").json()["id"]

    response = admin_client.patch(f"/users/{admin_id}/role", json={"role": "employee"})

    assert response.status_code == 409
    assert response.json()["detail"] == ADMIN_MUST_REMAIN_DETAIL

    db = SessionLocal()
    try:
        assert db.query(User).filter(User.role == "admin").count() == 1
        assert db.get(User, admin_id).role == "admin"
    finally:
        db.close()


def test_three_admins_demoting_a_different_admin_succeeds(monkeypatch) -> None:
    """AC-070: with three admins, demoting a different admin succeeds with
    200 and no 409 is raised."""
    admin_a = _signed_in_client(monkeypatch, "three-a@example.com", "A")
    employee_b = _signed_in_client(monkeypatch, "three-b@example.com", "B")
    employee_c = _signed_in_client(monkeypatch, "three-c@example.com", "C")
    b_id = employee_b.get("/me").json()["id"]
    c_id = employee_c.get("/me").json()["id"]

    assert admin_a.patch(f"/users/{b_id}/role", json={"role": "admin"}).status_code == 200
    assert admin_a.patch(f"/users/{c_id}/role", json={"role": "admin"}).status_code == 200

    response = admin_a.patch(f"/users/{b_id}/role", json={"role": "employee"})

    assert response.status_code == 200
    assert response.json()["role"] == "employee"

    db = SessionLocal()
    try:
        assert db.query(User).filter(User.role == "admin").count() == 2
    finally:
        db.close()


def test_two_admins_concurrently_demoting_each_other_leaves_one_admin(monkeypatch) -> None:
    """AC-069: two admins each demoting the other, dispatched so both pass
    their own admin check before either commits, serialised exactly at the
    `with_for_update()` boundary the implementation itself uses.

    SQLite (these fixtures' engine) does not honour `SELECT ... FOR UPDATE`
    the way Postgres does, so this test injects the equivalent of that row
    lock at the Python level: a `threading.Barrier` holds both requests at
    the admin-row scan until both have arrived (so neither has committed yet,
    and each already passed its own admin check honestly), then a
    `threading.Lock` -- released only when the holding session commits or
    rolls back -- forces one request's full read-decide-write to finish
    before the other's `.all()` executes its read. That reproduces, without a
    real database lock, exactly the ordering the production code relies on:
    the loser's count reflects the winner's already-committed demotion.
    """
    admin_a = _signed_in_client(monkeypatch, "concurrent-a@example.com", "A")
    employee_b = _signed_in_client(monkeypatch, "concurrent-b@example.com", "B")
    a_id = admin_a.get("/me").json()["id"]
    b_id = employee_b.get("/me").json()["id"]
    assert admin_a.patch(f"/users/{b_id}/role", json={"role": "admin"}).status_code == 200
    admin_b = employee_b  # same cookie session, now promoted to admin

    lock = threading.Lock()
    barrier = threading.Barrier(2)
    held: dict[str, object] = {"session": None}

    original_for_update = Query.with_for_update
    original_commit = OrmSession.commit
    original_rollback = OrmSession.rollback

    def patched_for_update(self, *args, **kwargs):
        barrier.wait(timeout=5)
        lock.acquire()
        held["session"] = self.session
        return original_for_update(self, *args, **kwargs)

    def _release(session_self) -> None:
        if held["session"] is session_self:
            held["session"] = None
            lock.release()

    def patched_commit(self, *args, **kwargs):
        result = original_commit(self, *args, **kwargs)
        _release(self)
        return result

    def patched_rollback(self, *args, **kwargs):
        result = original_rollback(self, *args, **kwargs)
        _release(self)
        return result

    monkeypatch.setattr(Query, "with_for_update", patched_for_update)
    monkeypatch.setattr(OrmSession, "commit", patched_commit)
    monkeypatch.setattr(OrmSession, "rollback", patched_rollback)

    results: dict[str, object] = {}

    def _demote(name: str, client: TestClient, target_id: int) -> None:
        results[name] = client.patch(f"/users/{target_id}/role", json={"role": "employee"})

    t1 = threading.Thread(target=_demote, args=("a_demotes_b", admin_a, b_id))
    t2 = threading.Thread(target=_demote, args=("b_demotes_a", admin_b, a_id))
    t1.start()
    t2.start()
    t1.join(timeout=10)
    t2.join(timeout=10)

    assert not t1.is_alive()
    assert not t2.is_alive()
    assert set(results) == {"a_demotes_b", "b_demotes_a"}

    statuses = sorted(r.status_code for r in results.values())
    assert statuses == [200, 409]

    loser = next(r for r in results.values() if r.status_code == 409)
    assert loser.json()["detail"] == ADMIN_MUST_REMAIN_DETAIL

    db = SessionLocal()
    try:
        assert db.query(User).filter(User.role == "admin").count() == 1
    finally:
        db.close()
