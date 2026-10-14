"""Pydantic request and response models.

One pair per entity in the approved data model, plus the placeholder every
generated route returns until it has been implemented.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class StubResponse(BaseModel):
    """What a generated route returns until someone implements it.

    A stub that returns a typed body rather than raising keeps the service
    startable and its OpenAPI document complete, so the frontend can be built
    against the agreed shape while the handlers are still being written.
    """

    endpoint: str
    status: str = "not_implemented"
    detail: str = "Scaffolded from the approved API spec; no behaviour yet."


class MeResponse(BaseModel):
    """What GET /me returns: the caller's own account."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    role: str


class UserOut(BaseModel):
    """One row of GET /users: the account list an admin manages."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    role: str
    created_at: datetime


class RoleUpdate(BaseModel):
    """The body PATCH /users/{id}/role accepts."""

    role: Literal["admin", "employee"]
