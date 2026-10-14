import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import Users from "./Users";
import { AuthProvider } from "@/lib/auth";

const ME_ADMIN = { id: 1, email: "dana@acme.com", name: "Dana Admin", role: "admin" };
const ME_EMPLOYEE = { id: 2, email: "sam@acme.com", name: "Sam Employee", role: "employee" };

const USERS = [
  { id: 1, email: "dana@acme.com", name: "Dana Admin", role: "admin", created_at: "2026-01-01T00:00:00Z" },
  { id: 3, email: "lee@acme.com", name: "Lee Employee", role: "employee", created_at: "2026-02-01T00:00:00Z" },
];

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

function renderUsers() {
  return render(
    <AuthProvider>
      <Users />
    </AuthProvider>
  );
}

describe("Users screen", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("lists accounts from GET /users and shows the admin role after promoting, without a manual refresh (AC-007)", async () => {
    const updated = { ...USERS[1], role: "admin" };
    const fetchMock = mockFetchSequence([jsonResponse(ME_ADMIN), jsonResponse(USERS), jsonResponse(updated)]);

    renderUsers();

    expect(await screen.findByText("Lee Employee")).toBeInTheDocument();
    expect(screen.getByText("Employee")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /make lee admin/i }));

    await waitFor(() => expect(screen.queryByText("Employee")).not.toBeInTheDocument());
    expect(screen.getAllByText("Admin")).toHaveLength(2);

    const patchCall = fetchMock.mock.calls.find(([, init]) => init?.method === "PATCH");
    expect(String(patchCall?.[0])).toContain("/users/3/role");
    expect(JSON.parse(String(patchCall?.[1]?.body))).toEqual({ role: "admin" });
  });

  it("shows a not-authorised state for an employee session and never renders the promote control (AC-008)", async () => {
    mockFetchSequence([jsonResponse(ME_EMPLOYEE)]);

    renderUsers();

    expect(await screen.findByText(/not authorised/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /make .* admin/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders an explicit error state on a 403 from GET /users rather than seeded data", async () => {
    mockFetchSequence([jsonResponse(ME_ADMIN), jsonResponse({ detail: "Forbidden" }, 403)]);

    renderUsers();

    expect(await screen.findByRole("alert")).toHaveTextContent(/permission/i);
    expect(screen.queryByText("Dana Admin")).not.toBeInTheDocument();
  });

  it("renders an explicit error state on a 401 from GET /users rather than seeded data", async () => {
    mockFetchSequence([jsonResponse(ME_ADMIN), jsonResponse({ detail: "Not authenticated" }, 401)]);

    renderUsers();

    expect(await screen.findByRole("alert")).toHaveTextContent(/permission/i);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
