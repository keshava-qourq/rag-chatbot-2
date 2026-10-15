"""Where uploaded originals are kept: local disk without a bucket, S3 with one."""

from __future__ import annotations

from io import BytesIO

import pytest
import redis

from app import config, queue, storage


@pytest.fixture
def disk(monkeypatch, tmp_path):
    monkeypatch.setenv("MEDIA_ROOT", str(tmp_path))
    monkeypatch.delenv("S3_BUCKET", raising=False)
    config.get_settings(refresh=True)
    yield tmp_path
    config.get_settings(refresh=True)


class FakeS3:
    def __init__(self) -> None:
        self.objects: dict[tuple[str, str], bytes] = {}

    def upload_fileobj(self, fileobj, bucket, key):
        self.objects[(bucket, key)] = fileobj.read()

    def get_object(self, Bucket, Key):  # noqa: N803 -- boto3's names
        return {"Body": BytesIO(self.objects[(Bucket, Key)])}

    def delete_object(self, Bucket, Key):  # noqa: N803
        self.objects.pop((Bucket, Key), None)


@pytest.fixture
def s3(monkeypatch):
    fake = FakeS3()
    monkeypatch.setenv("S3_BUCKET", "docs-bucket")
    monkeypatch.setenv("S3_PREFIX", "media/app1/")
    config.get_settings(refresh=True)
    monkeypatch.setattr(storage, "get_s3_client", lambda: fake)
    yield fake
    monkeypatch.delenv("S3_BUCKET")
    monkeypatch.delenv("S3_PREFIX")
    config.get_settings(refresh=True)


def test_without_a_bucket_files_are_kept_on_disk(disk) -> None:
    key = storage.store_file(BytesIO(b"hello"), "documents/abc-notes.txt")
    assert (disk / "documents" / "abc-notes.txt").read_bytes() == b"hello"
    assert storage.read_file(key) == b"hello"
    assert not list(disk.rglob("*.partial"))

    storage.delete_file(key)
    assert not (disk / "documents" / "abc-notes.txt").exists()
    storage.delete_file(key)  # already gone is fine


def test_a_key_cannot_escape_the_media_root(disk) -> None:
    with pytest.raises(ValueError):
        storage.store_file(BytesIO(b"x"), "../outside.txt")


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        ("report.pdf", "report.pdf"),
        ("../../etc/passwd", "passwd"),
        ("C:\\Users\\me\\plan v2.docx", "plan_v2.docx"),
        ("..", "file"),
    ],
)
def test_upload_names_become_one_safe_path_segment(name, expected) -> None:
    assert storage.safe_filename(name) == expected


def test_with_a_bucket_files_go_to_s3_under_the_prefix(s3, tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("MEDIA_ROOT", str(tmp_path))
    config.get_settings(refresh=True)
    key = storage.store_file(BytesIO(b"pdf-bytes"), "documents/abc-a.pdf")
    assert s3.objects == {("docs-bucket", "media/app1/documents/abc-a.pdf"): b"pdf-bytes"}
    assert storage.read_file(key) == b"pdf-bytes"
    assert not any(tmp_path.iterdir())

    storage.delete_file(key)
    assert s3.objects == {}


def test_an_unreachable_queue_does_not_fail_the_upload(monkeypatch) -> None:
    class DownQueue:
        def enqueue(self, *args):
            raise redis.exceptions.ConnectionError("Connection refused")

    monkeypatch.setattr(queue, "get_queue", lambda: DownQueue())
    assert queue.enqueue_document_processing(7) is False
