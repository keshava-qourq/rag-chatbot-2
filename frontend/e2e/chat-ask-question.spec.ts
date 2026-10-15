import { expect, test, type Page, type Route } from "@playwright/test";

// US-010 -- asking a question in the chat box.
//
// Chat's auth gate is pure client state driven by GET /me (see
// frontend/src/lib/auth.tsx and App.tsx): no sidebar/route renders until
// that call resolves. Unlike the Google-OAuth-gated specs in this folder,
// nothing here needs a real session cookie -- stubbing /me is enough to
// reach the Chat screen, and /conversations* is stubbed per the packet's
// constraint so no real SSE provider is exercised.

const ME_BODY = { id: 1, email: "ash@example.com", name: "Ash Patel", role: "employee" };

function sseFrame(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

const DONE_FRAME = "event: done\ndata: [DONE]\n\n";

async function stubMe(page: Page) {
  await page.route("**/me", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ME_BODY) })
  );
}

async function stubCreateConversation(page: Page, conversationId: string) {
  await page.route("**/conversations", async (route: Route) => {
    if (route.request().method() !== "POST") return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: conversationId, messages: [] }),
    });
  });
}

test.describe("AC-026: submitting a question renders it immediately and shows progress", () => {
  test("the question appears at once, a thinking indicator shows while streaming, then the answer renders", async ({
    page,
  }) => {
    await stubMe(page);
    await stubCreateConversation(page, "conv-1");

    let messageRequests = 0;
    await page.route("**/conversations/conv-1/messages", async (route) => {
      messageRequests += 1;
      // A short delay keeps the request in flight long enough to assert the
      // in-progress indicator before the stream resolves.
      await new Promise((resolve) => setTimeout(resolve, 300));
      const body =
        sseFrame({ token: "The sky is blue" }) + sseFrame({ token: " because of Rayleigh scattering." }) + DONE_FRAME;
      await route.fulfill({ status: 200, contentType: "text/event-stream", body });
    });

    await page.goto("/chat");
    const textbox = page.getByLabel("Your question");
    await textbox.fill("Why is the sky blue?");
    await page.getByRole("button", { name: "Send question" }).click();

    // Renders immediately -- before the stubbed stream has resolved.
    await expect(page.getByText("Why is the sky blue?")).toBeVisible();
    await expect(page.getByRole("status", { name: /thinking/i }).or(page.getByText("Thinking…"))).toBeVisible();
    await expect(page.getByRole("button", { name: "Send question" })).toBeDisabled();

    await expect(page.getByText("The sky is blue because of Rayleigh scattering.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send question" })).toBeEnabled();
    expect(messageRequests).toBe(1);
  });
});

test.describe("AC-027: empty or whitespace-only input cannot be submitted", () => {
  test("the Send control stays disabled and no request is sent for blank or whitespace input", async ({ page }) => {
    await stubMe(page);
    let conversationRequests = 0;
    await page.route("**/conversations", async (route) => {
      conversationRequests += 1;
      await route.fallback();
    });

    await page.goto("/chat");
    const sendButton = page.getByRole("button", { name: "Send question" });
    const textbox = page.getByLabel("Your question");

    // Empty.
    await expect(sendButton).toBeDisabled();

    // Whitespace only.
    await textbox.fill("   ");
    await expect(sendButton).toBeDisabled();
    await textbox.press("Enter");

    // Typed, then cleared back to whitespace.
    await textbox.fill("a real question");
    await expect(sendButton).toBeEnabled();
    await textbox.fill("   ");
    await expect(sendButton).toBeDisabled();

    expect(conversationRequests).toBe(0);
  });
});

test.describe("AC-028: a stream failure shows an error and retry resends the same question", () => {
  test("an error from the stubbed stream shows a failure message, and Retry resends without re-typing", async ({
    page,
  }) => {
    await stubMe(page);
    await stubCreateConversation(page, "conv-2");

    const receivedBodies: string[] = [];
    let attempt = 0;
    await page.route("**/conversations/conv-2/messages", async (route) => {
      attempt += 1;
      receivedBodies.push(route.request().postData() ?? "");
      if (attempt === 1) {
        await route.fulfill({
          status: 200,
          contentType: "text/event-stream",
          body: "event: error\ndata: The assistant couldn't answer that just now. Try again.\n\n",
        });
        return;
      }
      const body = sseFrame({ token: "Paris is the capital of France." }) + DONE_FRAME;
      await route.fulfill({ status: 200, contentType: "text/event-stream", body });
    });

    await page.goto("/chat");
    const textbox = page.getByLabel("Your question");
    await textbox.fill("What is the capital of France?");
    await page.getByRole("button", { name: "Send question" }).click();

    await expect(page.getByRole("alert")).toContainText("Couldn't get an answer");
    await expect(page.getByText("The assistant couldn't answer that just now. Try again.")).toBeVisible();

    // The question is not left sitting in the box to be retyped.
    await expect(textbox).toHaveValue("");

    const retryButton = page.getByRole("button", { name: "Retry" });
    await expect(retryButton).toBeVisible();
    await retryButton.click();

    await expect(page.getByText("Paris is the capital of France.")).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);

    expect(attempt).toBe(2);
    for (const raw of receivedBodies) {
      const parsed = JSON.parse(raw);
      expect(parsed.content).toBe("What is the capital of France?");
    }
    // Only one user bubble for the question -- retry did not resubmit it as a new message.
    await expect(page.getByText("What is the capital of France?")).toHaveCount(1);
  });
});
