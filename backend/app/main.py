"""Application entrypoint.

Generated from the approved architecture: one router per component that owns
endpoints, one route per endpoint the API spec declares. Every generated route
is a stub that returns a typed placeholder, so the service starts, serves its
OpenAPI document and passes its tests before a single handler is implemented.
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app import models  # noqa: F401 -- imported so the tables register before create_all
from app.database import Base, engine, ensure_pgvector_extension
from app.routers import auth as auth_router
from app.routers import users as users_router
from app.services import configured_services

app = FastAPI(
    title="RAG chatbot (2)",
    description="RAG chatbot",
    version="0.1.0",
)

# The SPA runs on a different origin than the API, so the browser refuses its calls
# unless that origin is allowed here. In development that is the Vite dev server; when
# deployed, the platform injects the frontend's real URL as ALLOWED_ORIGINS (comma
# separated). Point ALLOWED_ORIGINS at the real thing and nothing else has to change.
_dev_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
_allowed_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins or _dev_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Backs the session cookie every signed-in request relies on (see app/auth.py).
# Starlette's SessionMiddleware signs this cookie with SESSION_SECRET_KEY and
# marks it HTTP-only by default; the fallback below is only ever reached in a
# local clone that has not set the real secret, never in a deployed instance.
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET_KEY", "dev-insecure-secret-change-me"),
    same_site="lax",
    https_only=os.getenv("SESSION_COOKIE_SECURE", "").strip().lower() in {"1", "true", "yes"},
)

app.include_router(auth_router.router)
app.include_router(users_router.router)

# The scaffold ships no migrations, so the tables are created from the models on
# startup. Replace this with Alembic before anything holds data worth keeping.
# The pgvector extension has to exist before a model can declare a `Vector`
# column, so this runs first; it is a no-op on the SQLite fallback.
ensure_pgvector_extension()
Base.metadata.create_all(bind=engine)


@app.get("/health")
async def health() -> dict[str, object]:
    """Liveness probe, and the only route here that is not a stub."""
    return {"status": "ok", "services": configured_services()}
