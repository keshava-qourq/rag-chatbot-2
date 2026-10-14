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
