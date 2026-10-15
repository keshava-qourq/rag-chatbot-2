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

ADMIN_MUST_REMAIN_DETAIL = "At least one admin must remain"


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
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> User:
    """AC-067/068/069/070: never let the admin headcount reach zero.

    Two refusals happen before any write:

    - The caller's own id is always refused (AC-067), regardless of what
      role was requested -- a caller cannot change their own role at all
      through this endpoint, whether or not that particular change would
      have demoted the last admin.
    - A demotion away from "admin" (for someone else) is refused when it
      would leave zero admins (AC-068). The admin-row scan uses
      `with_for_update()` so, on a database that honours row locks, two
      concurrent demotions of different admins each lock the admin rows
      before counting: whichever transaction commits first is the one the
      second one's count reflects, so only one of two demotions that would
      together zero out the admins can succeed (AC-069).
    """
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=ADMIN_MUST_REMAIN_DETAIL)

    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if target.role == "admin" and body.role != "admin":
        admin_ids = [
            row.id
            for row in db.query(User.id).filter(User.role == "admin").with_for_update().all()
        ]
        remaining_admins = [admin_id for admin_id in admin_ids if admin_id != target.id]
        if not remaining_admins:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail=ADMIN_MUST_REMAIN_DETAIL
            )

    target.role = body.role
    db.commit()
    db.refresh(target)
    return target
