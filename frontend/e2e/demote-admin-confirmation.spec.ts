import { expect, test, type Page } from "@playwright/test";

// US-026-2 -- demoting another admin to employee requires confirmation.
//
// Like chat-ask-question.spec.ts, the auth gate here is pure client state
// driven by GET /me (frontend/src/lib/auth.tsx, App.tsx): stubbing /me as an
// admin is enough to reach the People screen with no real Google OAuth
// session, and /users plus /users/{id}/role are stubbed per the packet's
// constraint so no real backend state is touched.

const ME_ADMIN = { id: 1, email: "dana@acme.com", name: "Dana Admin", role: "admin" };

function otherAdmin() {
  return { id: 2, email: "alex@acme.com", name: "Alex Admin", role: "admin", created_at: "2026-01-02T00:00:00Z" };
}

async function stubMe(page: Page) {
  await page.route("**/me", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ME_ADMIN) })
  );
}

async function stubUsersList(page: Page, users: unknown[]) {
  await page.route("**/users", async (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(users) });
  });
}

async function gotoPeople(page: Page, users: unknown[]) {
  await stubMe(page);
  await stubUsersList(page, users);
  await page.goto("/users");
  await expect(page.getByRole("heading", { name: "People" })).toBeVisible();
  await expect(page.getByText("Alex Admin")).toBeVisible();
}

test.describe("AC-071: demoting another admin opens a confirmation dialog before any request", () => {
  test("clicking Remove admin rights shows a dialog and sends no PATCH until confirmed", async ({ page }) => {
    let patchRequests = 0;
    await page.route("**/users/2/role", async (route) => {
      patchRequests += 1;
      await route.fallback();
    });

    await gotoPeople(page, [otherAdmin()]);

    await page.getByRole("row", { name: /Alex Admin/ }).getByRole("button", { name: "Remove admin rights" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Remove admin rights from Alex Admin?");
    expect(patchRequests).toBe(0);
  });
});

test.describe("AC-072: confirming sends the PATCH and closes the dialog", () => {
  test("confirming demotes Alex to employee and the dialog closes", async ({ page }) => {
    let patchRequests = 0;
    let patchBody: unknown = null;
    await page.route("**/users/2/role", async (route) => {
      patchRequests += 1;
      patchBody = JSON.parse(route.request().postData() ?? "{}");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...otherAdmin(), role: "employee" }),
      });
    });

    await gotoPeople(page, [otherAdmin()]);

    await page.getByRole("row", { name: /Alex Admin/ }).getByRole("button", { name: "Remove admin rights" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Remove admin rights" }).click();

    await expect(dialog).toHaveCount(0);
    expect(patchRequests).toBe(1);
    expect(patchBody).toEqual({ role: "employee" });

    const row = page.getByRole("row", { name: /Alex Admin/ });
    await expect(row.getByText("Employee")).toBeVisible();
    await expect(row.getByText("Admin", { exact: true })).toHaveCount(0);
  });
});

test.describe("AC-073: cancelling sends no request and the row stays Admin", () => {
  test("Keep as admin closes the dialog with no PATCH sent", async ({ page }) => {
    let patchRequests = 0;
    await page.route("**/users/2/role", async (route) => {
      patchRequests += 1;
      await route.fallback();
    });

    await gotoPeople(page, [otherAdmin()]);

    await page.getByRole("row", { name: /Alex Admin/ }).getByRole("button", { name: "Remove admin rights" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Keep as admin" }).click();

    await expect(dialog).toHaveCount(0);
    expect(patchRequests).toBe(0);

    const row = page.getByRole("row", { name: /Alex Admin/ });
    await expect(row.getByText("Admin", { exact: true })).toBeVisible();
  });
});

test.describe("AC-074: a 409 last-admin refusal shows its message and leaves the role unchanged", () => {
  test("stubbed 409 'At least one admin must remain' is shown and the row still says Admin", async ({ page }) => {
    const detail = "At least one admin must remain";
    await page.route("**/users/2/role", async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ detail }),
      });
    });

    await gotoPeople(page, [otherAdmin()]);

    await page.getByRole("row", { name: /Alex Admin/ }).getByRole("button", { name: "Remove admin rights" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Remove admin rights" }).click();

    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("alert")).toContainText(detail);

    const row = page.getByRole("row", { name: /Alex Admin/ });
    await expect(row.getByText("Admin", { exact: true })).toBeVisible();
    await expect(row.getByText("Employee")).toHaveCount(0);
  });
});
