"""GET /me, GET /users, PATCH /users/{id}/role.

GET /me is open to any signed-in caller; the other two require the admin
guard from `app/auth.py` -- the same dependency the documents and
conversations routers will reuse later.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_admin
from app.database import get_db
from app.models import User
from app.schemas import MeResponse, RoleUpdate, UserOut

router = APIRouter(tags=["users"])


@router.get("/me", response_model=MeResponse)
async def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.get("/users", response_model=list[UserOut])
async def list_users(
    _admin: User = Depends(require_admin), db: Session = Depends(get_db)
) -> list[User]:
    return db.query(User).order_by(User.created_at).all()


@router.patch("/users/{user_id}/role", response_model=UserOut)
async def update_user_role(
    user_id: int,
    body: RoleUpdate,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> User:
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    target.role = body.role
    db.commit()
    db.refresh(target)
    return target
