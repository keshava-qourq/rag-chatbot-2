"""The one module that knows where original files live: S3 when configured, else local disk.

`app/routers/documents.py` calls `store_file` and the ingestion worker will call
`read_file`; neither knows which backend is in use, the same separation
`app/providers/openai_provider.py` keeps for the OpenAI SDK.

S3 is used when `S3_BUCKET` is set. Credentials come from boto3's own chain
(instance/container role, environment) unless explicit keys are configured.
Without a bucket, files go under `MEDIA_ROOT` on disk -- which must be a mounted
volume in production, or the files disappear when the container is replaced.
"""

from __future__ import annotations

import re
import shutil
from pathlib import Path
from typing import IO

from app.config import get_settings

_UNSAFE = re.compile(r"[^A-Za-z0-9._-]+")


def safe_filename(filename: str) -> str:
    """The upload's name reduced to a safe single path segment.

    The name comes from the browser, so `../../etc/passwd` or `a/b.pdf` must not
    become a path: only the last segment is kept and anything unusual becomes `_`.
    """
    name = _UNSAFE.sub("_", Path(filename.replace("\\", "/")).name).strip("._")
    return name[:120] or "file"


def using_s3() -> bool:
    return bool(get_settings().s3_bucket)


def get_s3_client():
    """A boto3 S3 client built from the configured AWS settings."""
    import boto3  # only needed when S3 is in use

    settings = get_settings()
    kwargs: dict[str, str] = {}
    if settings.aws_region:
        kwargs["region_name"] = settings.aws_region
    if settings.aws_access_key_id and settings.aws_secret_access_key:
        kwargs["aws_access_key_id"] = settings.aws_access_key_id
        kwargs["aws_secret_access_key"] = settings.aws_secret_access_key
    return boto3.client("s3", **kwargs)


def _s3_key(key: str) -> str:
    return f"{get_settings().s3_prefix}{key}"


def _disk_path(key: str) -> Path:
    root = Path(get_settings().media_root).resolve()
    path = (root / key).resolve()
    if root not in path.parents:
        raise ValueError(f"Storage key escapes MEDIA_ROOT: {key!r}")
    return path


def store_file(file_obj: IO[bytes], key: str) -> str:
    """Store `file_obj` under `key`; returns the key to record on the document."""
    if using_s3():
        get_s3_client().upload_fileobj(file_obj, get_settings().s3_bucket, _s3_key(key))
        return key
    path = _disk_path(key)
    path.parent.mkdir(parents=True, exist_ok=True)
    partial = path.with_name(path.name + ".partial")
    with partial.open("wb") as out:
        shutil.copyfileobj(file_obj, out)
    partial.replace(path)  # never leave a half-written file under the real name
    return key


def read_file(key: str) -> bytes:
    """The stored bytes for `key`, from wherever `store_file` put them."""
    if using_s3():
        response = get_s3_client().get_object(Bucket=get_settings().s3_bucket, Key=_s3_key(key))
        return response["Body"].read()
    return _disk_path(key).read_bytes()


def delete_file(key: str) -> None:
    """Remove a stored file; a file that is already gone is not an error."""
    if using_s3():
        get_s3_client().delete_object(Bucket=get_settings().s3_bucket, Key=_s3_key(key))
        return
    _disk_path(key).unlink(missing_ok=True)
