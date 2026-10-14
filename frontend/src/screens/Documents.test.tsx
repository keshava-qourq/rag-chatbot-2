import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import Documents from "./Documents";

function renderDocuments() {
  return render(
    <MemoryRouter>
      <Documents />
    </MemoryRouter>
  );
}

describe("Documents (admin knowledge-base console)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("lets an admin view, re-process and delete a document, with no option to edit its contents or author a new one (AC-066)", async () => {
    renderDocuments();

    await screen.findByText("Employee-Handbook-2026.pdf", undefined, { timeout: 2000 });

    // The screen states the restriction in plain language for the admin reading it.
    expect(screen.getByText(/can't be edited here/i)).toBeInTheDocument();

    // View, re-process and delete are all present and reachable...
    expect(screen.getAllByRole("button", { name: /re-process/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/^delete /i).length).toBeGreaterThan(0);
    expect(screen.getByText(/indexed passages/i)).toBeInTheDocument();

    // ...but nothing lets an admin edit a document's contents or author one from
    // scratch inside the app -- a document only ever arrives as an uploaded file.
    expect(screen.queryByRole("button", { name: /^edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save changes/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /new document/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /create document/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: /document (content|body|text)/i })
    ).not.toBeInTheDocument();

    const uploadInput = screen.getByLabelText(/choose files to upload/i);
    expect(uploadInput).toHaveAttribute("type", "file");
  });

  it("confirms re-processing only through in-app state, with no network call for a notification (AC-065)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderDocuments();
    await screen.findByText("Employee-Handbook-2026.pdf", undefined, { timeout: 2000 });

    const user = userEvent.setup();
    // Some rows' Re-process buttons start disabled (a document already
    // processing) -- pick one that is actually clickable, the way a person would.
    const reprocessButton = screen
      .getAllByRole("button", { name: /re-process/i })
      .find((button) => !button.hasAttribute("disabled"));
    expect(reprocessButton).toBeDefined();
    await user.click(reprocessButton as HTMLElement);

    const notice = await screen.findByRole("status");
    expect(notice).toHaveTextContent(/re-processing/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("confirms a successful upload only through in-app state, with no network call for a notification (AC-065)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderDocuments();
    await screen.findByText("Employee-Handbook-2026.pdf", undefined, { timeout: 2000 });

    const file = new File(["hello"], "New-Policy.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText(/choose files to upload/i) as HTMLInputElement;
    const user = userEvent.setup();
    await user.upload(input, file);

    const notice = await screen.findByRole("status");
    expect(notice).toHaveTextContent(/queued for extraction/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("deletes a document and confirms it only through in-app state, with no network call for a notification (AC-065)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderDocuments();
    await screen.findByText("Employee-Handbook-2026.pdf", undefined, { timeout: 2000 });

    const user = userEvent.setup();
    const [deleteButton] = screen.getAllByLabelText(/^delete /i);
    await user.click(deleteButton);

    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /delete permanently/i }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/is deleted/i));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
