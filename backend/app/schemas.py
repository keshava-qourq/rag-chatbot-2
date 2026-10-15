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


class DocumentOut(BaseModel):
    """One row of GET /documents, and the `document` a successful upload returns.

    `id` is a string even though the row's primary key is an int: the
    frontend (`frontend/src/lib/documents.ts`) treats document ids as opaque
    strings throughout.
    """

    id: str
    filename: str
    file_type: str
    size_bytes: int
    status: str
    failure_reason: str | None = None
    uploaded_by: str
    uploaded_at: datetime
    chunks: int | None = None


class UploadOutcome(BaseModel):
    """One element of POST /documents' response: one outcome per submitted file.

    `reason` is set only when `accepted` is false; `document` only when it is
    true -- a multi-file request reports each file's own outcome rather than
    failing the whole request for one bad file.
    """

    filename: str
    accepted: bool
    reason: str | None = None
    document: DocumentOut | None = None
