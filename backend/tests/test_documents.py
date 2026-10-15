"""Tests for POST /documents and GET /documents.

Storage and the queue are never touched: `store_file` and
`enqueue_document_processing` are monkeypatched on the router module, the
same way `test_auth.py` replaces `get_oauth` rather than contacting Google.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient
from starlette.responses import RedirectResponse

from app import auth as auth_module
from app.database import Base, SessionLocal, engine
from app.main import app
from app.models import Document, User
from app.routers import documents as documents_router


@pytest.fixture(autouse=True)
def _clean_tables():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    db.query(Document).delete()
    db.query(User).delete()
    db.commit()
    db.close()
    yield


@pytest.fixture(autouse=True)
def _stub_s3_and_queue(monkeypatch):
    """No real S3 write, no real Redis connection, for every test in this file."""
    s3_mock = MagicMock(return_value=None)
    queue_mock = MagicMock(return_value=None)
    monkeypatch.setattr(documents_router, "store_file", s3_mock)
    monkeypatch.setattr(documents_router, "enqueue_document_processing", queue_mock)
    yield s3_mock, queue_mock


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


def _admin_client(monkeypatch, email: str = "admin@example.com") -> TestClient:
    # First account becomes admin.
    return _signed_in_client(monkeypatch, email, "Admin")


def test_unauthenticated_requests_return_401(monkeypatch) -> None:
    client = TestClient(app)

    assert client.get("/documents").status_code == 401
    assert client.post("/documents", files={"files": ("a.pdf", b"hi", "application/pdf")}).status_code == 401


def test_non_admin_receives_403(monkeypatch) -> None:
    admin = _admin_client(monkeypatch)
    employee = _signed_in_client(monkeypatch, "employee@example.com", "Employee")

    assert employee.get("/documents").status_code == 403
    response = employee.post(
        "/documents", files={"files": ("a.pdf", b"hi", "application/pdf")}
    )
    assert response.status_code == 403
    assert admin  # admin fixture used only to seed the first-account-is-admin rule


def test_upload_valid_pdf_persists_document_stores_in_s3_and_enqueues_job(
    monkeypatch, _stub_s3_and_queue
) -> None:
    s3_mock, queue_mock = _stub_s3_and_queue
    admin = _admin_client(monkeypatch)

    response = admin.post(
        "/documents", files={"files": ("handbook.pdf", b"%PDF-1.4 fake content", "application/pdf")}
    )

    assert response.status_code == 200
    outcomes = response.json()
    assert len(outcomes) == 1
    outcome = outcomes[0]
    assert outcome["accepted"] is True
    assert outcome["filename"] == "handbook.pdf"
    document = outcome["document"]
    assert document["filename"] == "handbook.pdf"
    assert document["file_type"] == "pdf"
    assert document["size_bytes"] == len(b"%PDF-1.4 fake content")
    assert document["status"] == "processing"
    assert document["uploaded_by"] == "admin@example.com"
    assert document["failure_reason"] is None

    s3_mock.assert_called_once()
    queue_mock.assert_called_once()

    list_response = admin.get("/documents")
    assert list_response.status_code == 200
    rows = list_response.json()
    assert len(rows) == 1
    assert rows[0]["filename"] == "handbook.pdf"


def test_get_documents_orders_newest_upload_first(monkeypatch, _stub_s3_and_queue) -> None:
    admin = _admin_client(monkeypatch)

    admin.post("/documents", files={"files": ("first.txt", b"one", "text/plain")})
    admin.post("/documents", files={"files": ("second.md", b"two", "text/markdown")})

    rows = admin.get("/documents").json()
    assert [row["filename"] for row in rows] == ["second.md", "first.txt"]


def test_rejects_unsupported_extension_before_s3_write_or_enqueue(
    monkeypatch, _stub_s3_and_queue
) -> None:
    s3_mock, queue_mock = _stub_s3_and_queue
    admin = _admin_client(monkeypatch)

    response = admin.post(
        "/documents",
        files={"files": ("movie.mp4", b"not a document", "video/mp4")},
    )

    assert response.status_code == 200
    outcomes = response.json()
    assert len(outcomes) == 1
    assert outcomes[0]["accepted"] is False
    assert "PDF" in outcomes[0]["reason"]
    assert "DOCX" in outcomes[0]["reason"]
    assert "TXT" in outcomes[0]["reason"]
    assert "MD" in outcomes[0]["reason"]

    s3_mock.assert_not_called()
    queue_mock.assert_not_called()
    assert admin.get("/documents").json() == []


def test_rejects_oversize_file_before_s3_write(monkeypatch, _stub_s3_and_queue) -> None:
    s3_mock, queue_mock = _stub_s3_and_queue
    monkeypatch.setattr(documents_router, "MAX_FILE_SIZE_BYTES", 10)
    admin = _admin_client(monkeypatch)

    response = admin.post(
        "/documents",
        files={"files": ("big.txt", b"this content is longer than ten bytes", "text/plain")},
    )

    assert response.status_code == 200
    outcomes = response.json()
    assert outcomes[0]["accepted"] is False
    assert "50 MB" in outcomes[0]["reason"]

    s3_mock.assert_not_called()
    queue_mock.assert_not_called()
    assert admin.get("/documents").json() == []


def test_multi_file_upload_reports_per_file_outcome_and_keeps_valid_ones(
    monkeypatch, _stub_s3_and_queue
) -> None:
    s3_mock, queue_mock = _stub_s3_and_queue
    admin = _admin_client(monkeypatch)

    response = admin.post(
        "/documents",
        files=[
            ("files", ("good.docx", b"word content", "application/vnd.openxmlformats")),
            ("files", ("bad.xlsx", b"spreadsheet content", "application/vnd.ms-excel")),
            ("files", ("also-good.md", b"# heading", "text/markdown")),
        ],
    )

    assert response.status_code == 200
    outcomes = response.json()
    by_name = {o["filename"]: o for o in outcomes}
    assert by_name["good.docx"]["accepted"] is True
    assert by_name["bad.xlsx"]["accepted"] is False
    assert by_name["also-good.md"]["accepted"] is True

    assert s3_mock.call_count == 2
    assert queue_mock.call_count == 2

    rows = admin.get("/documents").json()
    assert {row["filename"] for row in rows} == {"good.docx", "also-good.md"}


def test_upload_works_with_no_bucket_and_no_redis(monkeypatch, tmp_path) -> None:
    """What a deployed container without S3 or Redis does: keep the file on disk, still 200."""
    from app import config, queue, storage

    monkeypatch.setattr(documents_router, "store_file", storage.store_file)
    monkeypatch.setattr(
        documents_router, "enqueue_document_processing", queue.enqueue_document_processing
    )
    monkeypatch.setenv("MEDIA_ROOT", str(tmp_path))
    monkeypatch.delenv("S3_BUCKET", raising=False)
    monkeypatch.setenv("REDIS_URL", "redis://127.0.0.1:1/0")  # nothing listens here
    config.get_settings(refresh=True)
    monkeypatch.setattr(queue, "_queue", None)
    monkeypatch.setattr(queue, "_redis_conn", None)
    admin = _admin_client(monkeypatch)

    try:
        response = admin.post(
            "/documents", files={"files": ("../hand book.pdf", b"%PDF-1.4 real", "application/pdf")}
        )
    finally:
        config.get_settings(refresh=True)

    assert response.status_code == 200
    assert response.json()[0]["accepted"] is True
    (saved,) = [p for p in tmp_path.rglob("*") if p.is_file()]
    assert saved.read_bytes() == b"%PDF-1.4 real"
    assert saved.name.endswith("-hand_book.pdf")
    assert saved.parent == tmp_path / "documents"
