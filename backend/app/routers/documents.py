"""POST /documents (multipart upload), GET /documents (the document list).

Both require the admin guard from `app/auth.py`, the same dependency
`app/routers/users.py` uses. Text extraction is a later packet's worker job;
this router only validates, stores the original in S3, persists the row and
enqueues exactly one processing job per accepted file.
"""

from __future__ import annotations

import uuid
from io import BytesIO

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.models import Document, User
from app.queue import enqueue_document_processing
from app.schemas import DocumentOut, UploadOutcome
from app.storage import upload_file_to_s3

router = APIRouter(tags=["documents"])

ALLOWED_FILE_TYPES = {"pdf", "docx", "txt", "md"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
SUPPORTED_TYPES_MESSAGE = (
    "Unsupported file type. Supported file types are PDF, DOCX, TXT and MD."
)
MAX_SIZE_MESSAGE = "File is too large. The maximum permitted file size is 50 MB."


def _extension(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def _to_document_out(document: Document) -> DocumentOut:
    return DocumentOut(
        id=str(document.id),
        filename=document.filename,
        file_type=document.file_type,
        size_bytes=document.size_bytes,
        status=document.status,
        failure_reason=document.failure_reason,
        uploaded_by=document.uploader.email,
        uploaded_at=document.uploaded_at,
        chunks=None,
    )


@router.get("/documents", response_model=list[DocumentOut])
async def list_documents(
    _admin: User = Depends(require_admin), db: Session = Depends(get_db)
) -> list[DocumentOut]:
    """AC-011: newest upload first, so a reload shows the stored record."""
    documents = (
        db.query(Document)
        .order_by(Document.uploaded_at.desc(), Document.id.desc())
        .all()
    )
    return [_to_document_out(document) for document in documents]


@router.post("/documents", response_model=list[UploadOutcome])
async def upload_documents(
    files: list[UploadFile] = File(...),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[UploadOutcome]:
    """AC-009/AC-012/AC-013: validate, store, persist and enqueue -- per file.

    A rejected file never reaches S3 or the queue (type and size are checked
    first), and one rejection does not stop the remaining files in the same
    request from being accepted.
    """
    outcomes: list[UploadOutcome] = []

    for upload in files:
        filename = upload.filename or "unnamed"
        extension = _extension(filename)

        if extension not in ALLOWED_FILE_TYPES:
            outcomes.append(
                UploadOutcome(filename=filename, accepted=False, reason=SUPPORTED_TYPES_MESSAGE)
            )
            await upload.close()
            continue

        contents = await upload.read()
        size_bytes = len(contents)

        if size_bytes > MAX_FILE_SIZE_BYTES:
            outcomes.append(
                UploadOutcome(filename=filename, accepted=False, reason=MAX_SIZE_MESSAGE)
            )
            await upload.close()
            continue

        s3_key = f"documents/{uuid.uuid4().hex}-{filename}"
        upload_file_to_s3(BytesIO(contents), s3_key)

        document = Document(
            filename=filename,
            file_type=extension,
            size_bytes=size_bytes,
            s3_key=s3_key,
            status="processing",
            uploader_id=admin.id,
        )
        db.add(document)
        db.commit()
        db.refresh(document)

        enqueue_document_processing(document.id)

        outcomes.append(
            UploadOutcome(filename=filename, accepted=True, document=_to_document_out(document))
        )
        await upload.close()

    return outcomes
