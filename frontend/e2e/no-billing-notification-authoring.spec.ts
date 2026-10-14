import { expect, test } from "@playwright/test";

// The frontend's webServer in playwright.config.ts always boots the backend at
// this address; E2E_API_BASE_URL lets a run against a real deployment point
// elsewhere, the same way E2E_BASE_URL does for the frontend origin.
const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://127.0.0.1:8000";

// US-024 -- no payment, notification or document-authoring surfaces.

test.describe("AC-064: no pricing, plan, subscription, invoice or payment-provider element", () => {
  test("the API's own contract names no billing, pricing, subscription or invoice endpoint", async ({
    request,
  }) => {
    const response = await request.get(`${API_BASE_URL}/openapi.json`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    const paths = Object.keys(body.paths as Record<string, unknown>);

    const forbidden = ["billing", "invoice", "subscription", "payment", "pricing", "plan", "checkout"];
    for (const path of paths) {
      const lowered = path.toLowerCase();
      for (const bad of forbidden) {
        expect(lowered, `unexpected billing-shaped endpoint: ${path}`).not.toContain(bad);
      }
    }
  });

  test("plausible billing endpoints return 404 on the API", async ({ request }) => {
    for (const path of ["/billing", "/invoices", "/subscriptions", "/payments", "/plans", "/pricing"]) {
      const response = await request.get(`${API_BASE_URL}${path}`);
      expect(response.status(), `${path} should not exist`).toBe(404);
    }
  });

  test("the sign-in screen -- the only screen reachable with no session -- shows no pricing, plan or payment element", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();

    const bodyText = (await page.locator("body").innerText()).toLowerCase();
    for (const bad of [
      "pricing",
      "subscription",
      "invoice",
      "upgrade",
      "stripe",
      "paypal",
      "credit card",
      "payment method",
    ]) {
      expect(bodyText, `found forbidden billing text: ${bad}`).not.toContain(bad);
    }
  });

  test.skip(
    true,
    "AC-064 also requires sweeping Chat, Documents and People for the same vocabulary. All three sit " +
      "behind Google Workspace SSO; GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are deployment secrets this " +
      "environment never sets (see the project's service-keys list), so no authenticated session can be " +
      "minted from this harness and those three screens cannot be navigated to and read here the way the " +
      "sign-in screen above was. frontend/src/screens/NoBillingSurfaces.test.tsx proves this criterion for " +
      "those screens directly instead: it renders Documents and Users (People) and asserts their visible " +
      "text matches none of the forbidden billing vocabulary, and it statically scans the source of every " +
      "screen file -- including Chat.tsx, which has no session-driven fetch of its own to render-and-wait on " +
      "-- for the same vocabulary, so no screen is left unswept even though not every screen is rendered here."
  );
});

test.describe("AC-065: no email or push notification of any kind", () => {
  test("the API's own contract names no notification or webhook endpoint", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/openapi.json`);
    const body = await response.json();
    const paths = Object.keys(body.paths as Record<string, unknown>);

    for (const path of paths) {
      const lowered = path.toLowerCase();
      expect(lowered, `${path} looks like a notification surface`).not.toContain("notif");
      expect(lowered, `${path} looks like a notification surface`).not.toContain("webhook");
    }
  });

  test("plausible notification endpoints return 404 on the API", async ({ request }) => {
    for (const path of ["/notifications", "/notify", "/push", "/webhooks"]) {
      const response = await request.get(`${API_BASE_URL}${path}`);
      expect(response.status(), `${path} should not exist`).toBe(404);
    }
  });
});

test.describe("AC-066: no document-editing or document-authoring surface", () => {
  test("the API's own contract has no route that edits a document's contents in place", async ({
    request,
  }) => {
    const response = await request.get(`${API_BASE_URL}/openapi.json`);
    const body = await response.json();
    const paths = body.paths as Record<string, Record<string, unknown>>;

    for (const [path, methods] of Object.entries(paths)) {
      if (!path.toLowerCase().includes("document")) continue;
      const upperMethods = Object.keys(methods).map((m) => m.toUpperCase());
      expect(upperMethods, `${path} exposes PUT, which looks like a content-replace route`).not.toContain(
        "PUT"
      );
    }
  });

  test.skip(
    true,
    "AC-066 (view/re-process/delete only, no edit or create control) needs the admin document " +
      "console, which sits behind Google Workspace SSO. GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are " +
      "deployment secrets this environment never sets (see the project's service-keys list), so a " +
      "real Google consent screen cannot be driven from this harness and no authenticated session " +
      "can be minted without one. frontend/src/screens/Documents.test.tsx proves this criterion " +
      "directly against the rendered admin console instead: Re-process and Delete are present, and " +
      "no Edit, Save changes, New document or document-content textbox control exists."
  );
});
