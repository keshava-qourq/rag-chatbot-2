"""The one module that imports boto3: stores and fetches original files in S3.

`app/routers/documents.py` calls `upload_file_to_s3` and never imports boto3
directly, the same separation `app/providers/openai_provider.py` keeps for
the OpenAI SDK -- swapping the client library, or stubbing it out in tests,
never touches the router.
"""

from __future__ import annotations

from typing import IO

import boto3

from app.config import ConfigurationError, get_settings


def get_s3_client():
    """A boto3 S3 client built from the configured AWS credentials.

    Falls back to boto3's own credential resolution (environment, instance
    profile, etc.) when explicit keys are not set -- only the region and
    explicit keys are ever passed here, never invented defaults.
    """
    settings = get_settings()
    kwargs: dict[str, str] = {}
    if settings.aws_region:
        kwargs["region_name"] = settings.aws_region
    if settings.aws_access_key_id and settings.aws_secret_access_key:
        kwargs["aws_access_key_id"] = settings.aws_access_key_id
        kwargs["aws_secret_access_key"] = settings.aws_secret_access_key
    return boto3.client("s3", **kwargs)


def upload_file_to_s3(file_obj: IO[bytes], key: str) -> str:
    """Store `file_obj` under `key` in the configured bucket; returns the key.

    Raises `ConfigurationError` -- naming S3_BUCKET -- rather than attempting
    an upload with no destination, the same fail-fast style
    `app/providers/openai_provider.py` uses for a missing API key.
    """
    settings = get_settings()
    if not settings.s3_bucket:
        raise ConfigurationError(
            "S3_BUCKET is not set, so uploaded files have nowhere to be stored. "
            "Set S3_BUCKET before accepting uploads."
        )
    client = get_s3_client()
    client.upload_fileobj(file_obj, settings.s3_bucket, key)
    return key
