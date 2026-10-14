"""SQLAlchemy models.

The approved architecture is a RAG chatbot backed by PostgreSQL 16 + pgvector:
users, documents, chunks (with vector embeddings), conversations, messages and
citations. None of those tables are declared here yet -- that is the
development sprint's work, one entity at a time, not this scaffold's. `Base`
is already bound to the engine and `main.py` imports this module before it
creates the schema, so a model added here needs no further wiring to be
picked up.
"""

from app.database import Base

__all__ = ["Base"]
