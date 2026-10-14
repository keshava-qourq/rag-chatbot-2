import { expect, test } from "@playwright/test";

// US-003 -- first account becomes admin, admins can promote others.
// The frontend's webServer in playwright.config.ts always boots the backend at
// this address; E2E_API_BASE_URL lets a run against a real deployment point
// elsewhere, the same way E2E_BASE_URL does for the frontend origin.
const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://127.0.0.1:8000";

test.describe("AC-006/AC-007/AC-008 contract: the role endpoints refuse anyone with no session", () => {
  test("GET /me returns 401 with no session cookie, not a profile", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/me`);

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).not.toHaveProperty("role");
  });

  test("GET /users -- the admin user list -- returns 401 with no session cookie, not the list", async ({
    request,
  }) => {
    const response = await request.get(`${API_BASE_URL}/users`);

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(false);
  });

  test("PATCH /users/{id}/role -- the promote action -- is refused with 401 with no session (AC-008)", async ({
    request,
  }) => {
    const response = await request.patch(`${API_BASE_URL}/users/1/role`, {
      data: { role: "admin" },
    });

    expect(response.status()).toBe(401);
  });
});

test("visiting the People admin page with no session shows only sign-in, never a user list (AC-008)", async ({
  page,
}) => {
  await page.goto("/users");

  await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "People" })).toHaveCount(0);
  await expect(page.getByRole("table")).toHaveCount(0);
});

test.describe("AC-006, AC-007 and the authenticated half of AC-008", () => {
  test.skip(
    true,
    "AC-006 (the first successful sign-in becomes admin, every later one becomes employee), " +
      "AC-007 (an admin promotes an employee on the People page and that user's role is admin on " +
      "their next load) and the signed-in half of AC-008 (an employee session refused inside the " +
      "admin area, no document data changed) all need an authenticated session, which needs a real " +
      "Google sign-in. GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are deployment secrets this environment " +
      "never sets (see the project's service-keys list), so Google's real consent screen cannot be " +
      "driven from this harness, and -- unlike the backend's own pytest suite, which runs in the same " +
      "process and can monkeypatch app.auth.get_oauth -- Playwright drives a separately spawned " +
      "backend process it cannot inject a fake OAuth client into. These three criteria are proved " +
      "directly against the real endpoints and the rendered screen instead: " +
      "backend/tests/test_auth.py::test_first_account_becomes_admin_subsequent_become_employee (AC-006), " +
      "backend/tests/test_users.py::test_admin_can_list_users_and_change_role and " +
      "::test_employee_cannot_list_users_or_change_roles (AC-007/AC-008 on the API), and " +
      "frontend/src/screens/Users.test.tsx plus the two /users-route cases added to " +
      "frontend/src/App.test.tsx (AC-007/AC-008 on the rendered admin area and the route guard)."
  );
});
