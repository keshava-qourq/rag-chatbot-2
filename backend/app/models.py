"""SQLAlchemy models.

The approved architecture is a RAG chatbot backed by PostgreSQL 16 + pgvector:
users, documents, chunks (with vector embeddings), conversations, messages and
citations. `User` is the first of those entities -- authentication and
authorization need somewhere to persist an account and its role before any of
the others can reference it. `Base` is already bound to the engine and
`main.py` imports this module before it creates the schema, so a model added
here needs no further wiring to be picked up.
"""

from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

__all__ = ["Base", "User"]


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
