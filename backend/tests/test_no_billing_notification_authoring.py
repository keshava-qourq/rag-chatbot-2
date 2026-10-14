"""US-024: no payment, notification or document-authoring surfaces.

These are absence criteria, not behaviour anyone drives through a request
body. There is no "cancel subscription" handler to call and watch succeed --
the only thing to prove is that the surface was never built, and that it
stays that way. So this scans the same two places a real one would have to
show up: the API's own OpenAPI contract (what a client can call), and the
backend source tree (what the server was written to do when an event
happens). Either growing the forbidden vocabulary back in is what should make
this fail.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

APP_SOURCE_DIR = Path(__file__).resolve().parent.parent / "app"


def _all_source_text() -> str:
    """Every line of backend application source, concatenated for one scan."""
    return "\n".join(p.read_text(encoding="utf-8") for p in APP_SOURCE_DIR.rglob("*.py"))


def _openapi_paths() -> dict:
    response = client.get("/openapi.json")
    assert response.status_code == 200
    return response.json()["paths"]


# AC-064: no pricing, plan, subscription, invoice or payment-provider element.
# ---------------------------------------------------------------------------


def test_openapi_has_no_billing_pricing_or_payment_endpoint() -> None:
    """Given the delivered API, when its contract is reviewed, then no path
    names pricing, a plan, a subscription, an invoice or a payment provider
    (AC-064)."""
    paths = _openapi_paths()
    forbidden = ["billing", "invoice", "subscription", "payment", "pricing", "plan", "checkout"]
    for path in paths:
        lowered = path.lower()
        for bad in forbidden:
            assert bad not in lowered, f"unexpected billing-shaped endpoint: {path}"


@pytest.mark.parametrize(
    "guessed_path",
    ["/billing", "/invoices", "/subscriptions", "/payments", "/plans", "/pricing", "/checkout"],
)
def test_guessed_billing_endpoints_do_not_exist(guessed_path: str) -> None:
    """No billing surface exists to call, even by a plausible guess (AC-064)."""
    response = client.get(guessed_path)
    assert response.status_code == 404


def test_source_never_names_a_payment_provider_or_pricing_concept() -> None:
    """The backend never imports or references a payment-provider SDK, or a
    pricing/subscription/invoice concept, anywhere in its source (AC-064)."""
    source = _all_source_text().lower()
    for term in ["stripe", "paypal", "braintree", "adyen", "invoice", "subscription", "pricing"]:
        assert term not in source, f"found forbidden billing term {term!r} in backend source"


# AC-065: events are surfaced only through in-app state, never email/push.
# ---------------------------------------------------------------------------


def test_source_never_sends_email_or_push_notifications() -> None:
    """No event in the backend -- upload completion, upload failure, a new
    answer -- is wired to an email or push-notification call; a user can only
    learn of it through in-app state the next time they visit (AC-065)."""
    source = _all_source_text().lower()
    forbidden = [
        "smtplib",
        "sendgrid",
        "twilio",
        "send_mail(",
        "emailmessage(",
        "ses.send_email",
        "sns.publish",
        "webpush",
        "fcm.send",
        "apns",
    ]
    for term in forbidden:
        assert term not in source, f"found forbidden notification call {term!r} in backend source"


def test_source_never_names_an_aws_notification_service_as_a_bare_token() -> None:
    """Extends the call-shaped check above with the literal tokens the ticket
    names (AC-065): `ses` and `sns` as whole words, not only as the specific
    `ses.send_email` / `sns.publish` call shapes. A whole-word match avoids
    false positives on unrelated identifiers (e.g. "sessions", "responses")
    while still catching `boto3.client("ses")`, `import ses`, or any other
    form of reaching for AWS's email/push services that the narrower check
    above would miss."""
    source = _all_source_text().lower()
    for term in ["ses", "sns"]:
        assert not re.search(rf"\b{term}\b", source), (
            f"found bare AWS notification-service token {term!r} in backend source"
        )


def test_openapi_has_no_notification_or_webhook_endpoint() -> None:
    """There is no /notifications (or similarly named) surface for the backend
    to push a message through (AC-065)."""
    paths = _openapi_paths()
    for path in paths:
        lowered = path.lower()
        assert "notif" not in lowered
        assert "webhook" not in lowered


@pytest.mark.parametrize("guessed_path", ["/notifications", "/notify", "/push", "/webhooks"])
def test_guessed_notification_endpoints_do_not_exist(guessed_path: str) -> None:
    """No notification surface exists to call, even by a plausible guess (AC-065)."""
    response = client.get(guessed_path)
    assert response.status_code == 404


# AC-066: a document can be viewed, re-processed or deleted -- never edited.
# ---------------------------------------------------------------------------


def test_no_route_edits_a_documents_contents() -> None:
    """A document route may exist to view, re-process or delete, but none may
    let an admin edit its contents in place (AC-066).

    Forward-looking guard: no other ticket has built the documents router
    yet, so today this inspects an empty set of document routes. It is kept
    here, not dropped, because it is exactly the check that must start
    failing the moment a PUT (content replace-in-place) route is added to a
    `document` path instead of the upload/re-process/delete shape the ticket
    requires.
    """
    paths = _openapi_paths()
    for path, methods in paths.items():
        if "document" not in path.lower():
            continue
        assert "put" not in {m.lower() for m in methods}, (
            f"{path} exposes PUT, which looks like editing a document's contents in place"
        )


def test_schemas_define_no_document_content_edit_or_authoring_shape() -> None:
    """The request/response schemas never declare a way to submit or replace a
    document's body text directly -- a document only ever arrives as an
    uploaded file (AC-066)."""
    source = _all_source_text()
    for term in ["DocumentEdit", "DocumentContentUpdate", "DocumentCreate", "DocumentAuthor"]:
        assert term not in source, f"found a document-authoring schema shape: {term!r}"
