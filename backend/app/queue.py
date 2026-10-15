"""The one module that imports rq/redis: enqueues document-processing jobs.

`app/routers/documents.py` calls `enqueue_document_processing` and never
touches `rq` or `redis` directly. The job itself (text extraction, chunking,
embedding) is the next packet's worker; this module only has to put exactly
one job on the queue per accepted file.
"""

from __future__ import annotations

import redis
from rq import Queue

from app.config import get_settings

QUEUE_NAME = "document-processing"
PROCESS_DOCUMENT_JOB = "app.jobs.process_document"

_redis_conn: redis.Redis | None = None
_queue: Queue | None = None


def get_queue() -> Queue:
    """The shared RQ queue, built once and reused across requests."""
    global _redis_conn, _queue
    if _queue is None:
        settings = get_settings()
        _redis_conn = redis.from_url(settings.redis_url)
        _queue = Queue(QUEUE_NAME, connection=_redis_conn)
    return _queue


def enqueue_document_processing(document_id: int) -> None:
    """Enqueue exactly one processing job for the given document id.

    Enqueued by dotted path (`app.jobs.process_document`) rather than an
    imported callable: the worker job is a later packet, and the queue does
    not need that module to exist yet to accept the job.
    """
    get_queue().enqueue(PROCESS_DOCUMENT_JOB, document_id)
