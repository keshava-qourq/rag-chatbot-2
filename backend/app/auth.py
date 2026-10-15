"""Session handling, the corporate-domain allow-list, and the Google OAuth client.

`app/routers/auth.py` and `app/routers/users.py` import from here rather than
reaching for authlib or `request.session` directly, so the session's shape --
a user id keyed under `"user_id"` -- and the allow-list's rule are each
defined exactly once.

`ALLOWED_EMAIL_DOMAIN` and `SESSION_SECRET_KEY`/`AUTH_SECRET` are read
directly from the environment here, not through `app/config.py`: that module
is owned by a different ticket and this one may only import from it, not
extend it.
"""

from __future__ import annotations

import os

from authlib.integrations.starlette_client import OAuth
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import User

GOOGLE_SERVER_METADATA_URL = "https://accounts.google.com/.well-known/openid-configuration"
SESSION_USER_ID_KEY = "user_id"

ACCESS_LIMITED_DETAIL = "access is limited to company accounts"

_oauth: OAuth | None = None


def get_oauth() -> OAuth:
    """The registered Google OAuth client, built once and reused.

    A module-level singleton rather than a fresh `OAuth()` per request --
    authlib discovers Google's server metadata once and caches it. Tests
    replace this function's return value wholesale rather than hitting
    Google, so they never make a network call.
    """
    global _oauth
    if _oauth is None:
        settings = get_settings()
        oauth = OAuth()
        oauth.register(
            name="google",
            client_id=settings.google_client_id,
            client_secret=settings.google_client_secret,
            server_metadata_url=GOOGLE_SERVER_METADATA_URL,
            client_kwargs={"scope": "openid email profile"},
        )
        _oauth = oauth
    return _oauth


def allowed_domains() -> set[str]:
    """The configured allow-list, read fresh from the environment every call.

    Read from `ALLOWED_EMAIL_DOMAIN` -- the exact key name the product owner
    is told to set before deployment -- not a name this module invented.
    Comma-separated so more than one corporate domain can still be allowed
    under that one key. Read fresh (not cached) so a test can change
    `ALLOWED_EMAIL_DOMAIN` between cases without reaching into module state.
    Deployment sets this once at process start; re-reading it costs nothing
    meaningful there.
    """
    raw = os.getenv("ALLOWED_EMAIL_DOMAIN", "")
    return {domain.strip().lower() for domain in raw.split(",") if domain.strip()}


def is_allowed_email(email: str) -> bool:
    """True when the email's domain is on the allow-list.

    An empty allow-list (nothing configured) allows every domain -- useful
    for local development -- rather than silently locking every account out.
    """
    domains = allowed_domains()
    if not domains:
        return True
    _, _, domain = email.rpartition("@")
    return domain.lower() in domains


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """The signed-in caller, or a 401 -- the dependency every protected route uses."""
    user_id = request.session.get(SESSION_USER_ID_KEY)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user = db.get(User, user_id)
    if user is None:
        # The session names a user who no longer exists; treat it the same as
        # no session at all rather than raising a 500.
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    """The signed-in caller, or a 403 when they are not an admin.

    Documents and conversations routers (built by later packets) depend on
    this the same way `app/routers/users.py` does, so admin-only behaviour is
    defined once.
    """
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")
    return user
