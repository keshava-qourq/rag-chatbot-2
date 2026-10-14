import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/lib/auth";
import Documents from "./Documents";
import SignIn from "./SignIn";
import Users from "./Users";

const ME_ADMIN = { id: 1, email: "dana@acme.com", name: "Dana Admin", role: "admin" };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function mockFetchSequence(responses: Response[]) {
  const fetchMock = vi.fn();
  responses.forEach((r) => fetchMock.mockResolvedValueOnce(r));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// AC-064: given the delivered application, when any screen is reviewed, then
// there is no pricing, plan, subscription, invoice or payment-provider
// element present -- this is an internally funded tool with no payments
// feature to show anywhere.
const FORBIDDEN_BILLING_TEXT =
  /\b(pricing|price|plan|subscription|invoice|billing|checkout|upgrade|stripe|paypal|braintree)\b|payment method|credit card/i;

describe("No pricing, plan, subscription, invoice or payment-provider element on any screen (AC-064)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("the sign-in screen shows no billing or pricing language", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/sign-in"]}>
        <SignIn />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeInTheDocument();
    expect(container.textContent).not.toMatch(FORBIDDEN_BILLING_TEXT);
  });

  it("the documents (knowledge base) admin console shows no billing or pricing language", async () => {
    const { container } = render(
      <MemoryRouter>
        <Documents />
      </MemoryRouter>
    );

    await screen.findByText("Employee-Handbook-2026.pdf", undefined, { timeout: 2000 });
    expect(container.textContent).not.toMatch(FORBIDDEN_BILLING_TEXT);
  });

  it("the people (users and roles) admin console shows no billing or pricing language", async () => {
    mockFetchSequence([jsonResponse(ME_ADMIN), jsonResponse([])]);

    const { container } = render(
      <AuthProvider>
        <Users />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText("No accounts yet.")).toBeInTheDocument());
    expect(container.textContent).not.toMatch(FORBIDDEN_BILLING_TEXT);
  });
});

// ---------------------------------------------------------------------------
// Static source scan, covering every screen -- including Chat.
//
// The three tests above render and inspect three of the app's screens, the
// same way a reviewer would look at a rendered page. Chat is deliberately
// left out of that group: it is a large, data-heavy generated screen with no
// session-driven fetch of its own to anchor a render-and-wait test on (unlike
// Documents' or Users' seeded/awaited text), and guessing at its internal
// control labels would produce a test that looks like coverage but is not.
// AC-064 says "any screen", which includes Chat, so instead of skipping it
// this scans the actual source text of every screen file the same way
// backend/tests/test_no_billing_notification_authoring.py scans the backend
// source tree: a forbidden word has nowhere to hide, whether it is wired up
// as a rendered string or not, and the check does not need to know which DOM
// node it would land in. It also covers App.tsx (the shell every screen
// mounts inside) and keeps working unmodified if another screen is added.
// ---------------------------------------------------------------------------

const SCREENS_DIR = dirname(fileURLToPath(import.meta.url));
const APP_FILE = join(SCREENS_DIR, "..", "App.tsx");

function screenSourceFiles(): string[] {
  const screenFiles = readdirSync(SCREENS_DIR)
    .filter((name) => name.endsWith(".tsx") && !name.includes(".test."))
    .map((name) => join(SCREENS_DIR, name));
  return [...screenFiles, APP_FILE];
}

function readAllScreenSource(): { file: string; text: string }[] {
  return screenSourceFiles().map((file) => ({ file, text: readFileSync(file, "utf-8") }));
}

describe("Static scan of every screen's source (AC-064, AC-065, AC-066)", () => {
  it("includes Chat.tsx and App.tsx, so the scan below cannot silently cover zero files", () => {
    const files = screenSourceFiles().map((f) => f.split("/").pop());
    expect(files).toContain("Chat.tsx");
    expect(files).toContain("Documents.tsx");
    expect(files).toContain("App.tsx");
  });

  it("no screen's source contains pricing, plan, subscription, invoice or payment-provider language (AC-064)", () => {
    for (const { file, text } of readAllScreenSource()) {
      expect(text, `${file} contains forbidden billing/pricing language`).not.toMatch(
        FORBIDDEN_BILLING_TEXT
      );
    }
  });

  it("no screen's source calls an email or push-notification API for any event, including a new chat answer (AC-065)", () => {
    const forbidden = [
      "new notification(",
      "notification.requestpermission",
      "pushmanager",
      "serviceworker.register",
      "sendemail",
      "smtplib",
      "sendgrid",
      "twilio",
      "webpush",
      "fcm.send",
      "apns",
    ];
    for (const { file, text } of readAllScreenSource()) {
      const lowered = text.toLowerCase();
      for (const term of forbidden) {
        expect(lowered, `${file} contains forbidden notification call ${term}`).not.toContain(term);
      }
    }
  });

  it("no screen's source offers a control to edit a document's contents in place or author a new one (AC-066)", () => {
    const forbidden = [
      "new document",
      "create document",
      "contenteditable",
      "document editor",
      "edit document",
      "save changes",
    ];
    for (const { file, text } of readAllScreenSource()) {
      const lowered = text.toLowerCase();
      for (const term of forbidden) {
        expect(lowered, `${file} contains a document-authoring affordance: ${term}`).not.toContain(
          term
        );
      }
    }
  });
});
