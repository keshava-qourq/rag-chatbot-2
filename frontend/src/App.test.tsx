import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

const ME_EMPLOYEE = { id: 1, email: "dana@acme.com", name: "Dana Employee", role: "employee" };
const ME_ADMIN = { id: 2, email: "ash@acme.com", name: "Ash Admin", role: "admin" };

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

describe("App", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows only the sign-in screen, with no sidebar, when signed out (AC-001, AC-005)", async () => {
    mockFetchSequence([jsonResponse({ detail: "Not authenticated" }, 401)]);

    render(
      <MemoryRouter initialEntries={["/documents"]}>
        <App />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("button", { name: "Sign in with Google" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Choose an account")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/work email/i)).not.toBeInTheDocument();
    expect(screen.queryByText("RAG chatbot (2)")).not.toBeInTheDocument();
    expect(screen.queryByText("Documents")).not.toBeInTheDocument();
    expect(screen.queryByText("People")).not.toBeInTheDocument();
  });

  it("loads /me and renders the chat screen for a signed-in employee, hiding admin nav (AC-002)", async () => {
    mockFetchSequence([jsonResponse(ME_EMPLOYEE)]);

    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText("Dana Employee")).toBeInTheDocument();
    expect(screen.getByText("Chat")).toBeInTheDocument();
    expect(screen.queryByText("Documents")).not.toBeInTheDocument();
    expect(screen.queryByText("People")).not.toBeInTheDocument();
  });

  it("shows admin nav entries only when GET /me returns role admin", async () => {
    mockFetchSequence([jsonResponse(ME_ADMIN)]);

    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText("Ash Admin")).toBeInTheDocument();
    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("People")).toBeInTheDocument();
  });

  it("signs out, clears client state and returns to the sign-in screen (AC-003)", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetchSequence([
      jsonResponse(ME_ADMIN),
      jsonResponse({ status: "ok" }),
    ]);

    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>
    );

    await screen.findByText("Ash Admin");

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(
      await screen.findByRole("button", { name: "Sign in with Google" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Ash Admin")).not.toBeInTheDocument();

    const logoutCall = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
    expect(logoutCall).toBeTruthy();
    expect(String(logoutCall?.[0])).toContain("/auth/logout");
  });
});
