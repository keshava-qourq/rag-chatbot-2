"""Google Workspace SSO: GET /auth/login, GET /auth/callback, POST /auth/logout.

The only two GET routes here (plus /health) are exempt from the session
requirement every other route imposes -- that is how a signed-out browser
ever reaches Google in the first place.
"""

from __future__ import annotations

import os

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app import auth as auth_module
from app.database import get_db
from app.models import User

router = APIRouter(tags=["auth"])


@router.get("/auth/login")
async def login(request: Request) -> RedirectResponse:
    """Redirect the browser to Google's consent screen."""
    oauth = auth_module.get_oauth()
    settings_redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    redirect_uri = settings_redirect_uri or str(request.url_for("auth_callback"))
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/auth/callback", name="auth_callback")
async def callback(request: Request, db: Session = Depends(get_db)) -> RedirectResponse:
    """Exchange the code, match or create a User, and start a session.

    Order matters for AC-004: the allow-list is checked before anything is
    written or any session key is set, so a rejected domain leaves no trace.
    """
    oauth = auth_module.get_oauth()
    token = await oauth.google.authorize_access_token(request)
    userinfo = token.get("userinfo") or {}
    email = userinfo.get("email")
    name = userinfo.get("name") or email

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google did not return an email address",
        )

    if not auth_module.is_allowed_email(email):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=auth_module.ACCESS_LIMITED_DETAIL,
        )

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        is_first_account = db.query(User).count() == 0
        user = User(email=email, name=name, role="admin" if is_first_account else "employee")
        db.add(user)
        db.commit()
        db.refresh(user)

    request.session[auth_module.SESSION_USER_ID_KEY] = user.id

    chat_url = os.getenv("FRONTEND_CHAT_URL", "/chat")
    return RedirectResponse(url=chat_url, status_code=status.HTTP_302_FOUND)


@router.post("/auth/logout")
async def logout(
    request: Request, user: User = Depends(auth_module.get_current_user)
) -> dict[str, str]:
    """Invalidate the session cookie; /me and every protected route 401 afterwards."""
    request.session.clear()
    return {"status": "ok"}
