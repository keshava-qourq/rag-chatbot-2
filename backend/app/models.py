"""SQLAlchemy models.

The approved architecture is a RAG chatbot backed by PostgreSQL 16 + pgvector:
users, documents, chunks (with vector embeddings), conversations, messages and
citations. `User` is the first of those entities -- authentication and
authorization need somewhere to persist an account and its role before any of
the others can reference it. `Document` is the second: the documents API
needs somewhere to record each uploaded file's metadata and processing
status before the ingestion worker (a later packet) can act on it. `Base` is
already bound to the engine and `main.py` imports this module before it
creates the schema, so a model added here needs no further wiring to be
picked up.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

__all__ = ["Base", "User", "Document"]


class User(Base):
    """A person who has signed in through Google Workspace SSO.

    `role` is a plain string rather than an enum column so a new role never
    needs a migration -- the only two values the API accepts today are
    `"admin"` and `"employee"`, enforced in `app/schemas.py`, not here.
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False, default="employee")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class Document(Base):
    """One uploaded file: its storage location, status and who uploaded it.

    `status` is a plain string (`"processing"`, `"ready"`, `"failed"`) for the
    same reason `User.role` is -- the worker job (a later packet) that moves
    a document through those states should not need a migration to do so.
    `s3_key` is the only pointer back to the file's bytes; the row itself
    never stores file content.
    """

    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    filename: Mapped[str] = mapped_column(String, nullable=False)
    file_type: Mapped[str] = mapped_column(String, nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    s3_key: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="processing")
    failure_reason: Mapped[str | None] = mapped_column(String, nullable=True)
    uploader_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    uploader: Mapped["User"] = relationship("User")
