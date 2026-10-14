import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import SignIn from "./SignIn";

describe("SignIn", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a single Google sign-in action with no seeded accounts, password or sign-up control", () => {
    render(
      <MemoryRouter initialEntries={["/sign-in"]}>
        <SignIn />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeInTheDocument();
    expect(screen.queryByText(/choose an account/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Marta Kovač")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument();
  });

  it("navigates to the backend login endpoint on click (AC-002)", async () => {
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    render(
      <MemoryRouter initialEntries={["/sign-in"]}>
        <SignIn />
      </MemoryRouter>
    );

    screen.getByRole("button", { name: "Sign in with Google" }).click();

    expect(window.location.href).toContain("/auth/login");
    assign.mockClear();
  });

  it("shows the access-limited message when the backend rejected an off-domain account (AC-004)", () => {
    render(
      <MemoryRouter initialEntries={["/sign-in?error=domain"]}>
        <SignIn />
      </MemoryRouter>
    );

    expect(screen.getByRole("alert")).toHaveTextContent("access is limited to company accounts");
  });

  it("shows no error banner when there was no error param", () => {
    render(
      <MemoryRouter initialEntries={["/sign-in"]}>
        <SignIn />
      </MemoryRouter>
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
