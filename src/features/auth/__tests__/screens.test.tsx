import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeAuthClient, fakeSession } from "@/lib/supabase/testing";
import { AuthCallbackScreen } from "../components/AuthCallbackScreen";
import { LogInScreen } from "../components/LogInScreen";
import { SignUpScreen } from "../components/SignUpScreen";
import { AUTH_COPY, AUTH_ERROR_MESSAGES } from "../messages";
import { sessionStore } from "../session-store";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace, prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
}));

let onLine: ReturnType<typeof vi.spyOn>;
let fake: ReturnType<typeof createFakeAuthClient>;

beforeEach(() => {
  replace.mockReset();
  fake = createFakeAuthClient();
  onLine = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  sessionStore.setState({ ready: true, status: "signed-out", user: null });
  window.history.replaceState({}, "", "/sign-up");
});

afterEach(() => {
  vi.restoreAllMocks();
});

const emailField = () => screen.getByLabelText(AUTH_COPY.email);
const passwordField = () => screen.getByLabelText(AUTH_COPY.password);

async function fill(email: string, password: string) {
  const user = userEvent.setup();
  if (email) await user.type(emailField(), email);
  if (password) await user.type(passwordField(), password);
  return user;
}

describe("/sign-up (PLT-010)", () => {
  it("criterion 2: labelled fields, hint, button and the log-in link", () => {
    render(<SignUpScreen load={fake.load} />);
    expect(screen.getByRole("heading", { level: 1, name: "Create your account" })).toBeVisible();
    expect(emailField()).toHaveAttribute("type", "email");
    expect(passwordField()).toHaveAccessibleDescription("At least 8 characters");
    expect(screen.getByRole("button", { name: "Create account" })).toBeEnabled();
    expect(screen.getByText("Already have an account?")).toBeVisible();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/log-in");
  });

  it("criterion 9: autocomplete and the Show password toggle", async () => {
    render(<SignUpScreen load={fake.load} />);
    expect(emailField()).toHaveAttribute("autocomplete", "email");
    expect(passwordField()).toHaveAttribute("autocomplete", "new-password");
    expect(passwordField()).toHaveAttribute("type", "password");
    const toggle = screen.getByRole("button", { name: "Show password" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.setup().click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(passwordField()).toHaveAttribute("type", "text");
  });

  it("criterion 3: invalid email, focus moves there and nothing is sent", async () => {
    render(<SignUpScreen load={fake.load} />);
    const user = await fill("not-an-email", "short");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(emailField()).toHaveAccessibleDescription("Enter a valid email address.");
    expect(emailField()).toHaveAttribute("aria-invalid", "true");
    expect(passwordField()).toHaveAccessibleDescription(
      "At least 8 characters Use at least 8 characters.",
    );
    expect(emailField()).toHaveFocus();
    expect(fake.auth.signUp).not.toHaveBeenCalled();
  });

  it("criterion 3: a short password focuses the password field", async () => {
    render(<SignUpScreen load={fake.load} />);
    const user = await fill("learner@example.com", "1234567");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(passwordField()).toHaveFocus();
    expect(screen.getByText("Use at least 8 characters.")).toBeVisible();
    expect(fake.auth.signUp).not.toHaveBeenCalled();
  });

  it("criterion 4: while sending the button is disabled and relabelled; sent once", async () => {
    let resolve!: (v: unknown) => void;
    fake.auth.signUp.mockReturnValue(new Promise((r) => (resolve = r)));
    render(<SignUpScreen load={fake.load} />);
    const user = await fill("learner@example.com", "correct-horse");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    const busy = await screen.findByRole("button", { name: "Creating your account…" });
    expect(busy).toBeDisabled();
    await user.type(passwordField(), "{Enter}");
    expect(fake.auth.signUp).toHaveBeenCalledTimes(1);
    expect(fake.auth.signUp).toHaveBeenCalledWith({
      email: "learner@example.com",
      password: "correct-horse",
      options: { emailRedirectTo: "http://localhost:3000/auth/callback" },
    });
    await act(async () =>
      resolve({ data: { user: { identities: [{}] }, session: null }, error: null }),
    );
  });

  it.each([
    [{ code: "user_already_exists", status: 422 }, AUTH_ERROR_MESSAGES.email_taken],
    [{ code: "over_request_rate_limit", status: 429 }, AUTH_ERROR_MESSAGES.rate_limited],
    [{ name: "AuthRetryableFetchError", status: 0 }, AUTH_ERROR_MESSAGES.network],
  ])("criterion 5: %o shows kind copy", async (error, message) => {
    fake.auth.signUp.mockResolvedValue({ data: { user: null, session: null }, error });
    render(<SignUpScreen load={fake.load} />);
    const user = await fill("learner@example.com", "correct-horse");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.getByRole("button", { name: "Create account" })).toBeEnabled();
  });

  it("criterion 5: an existing email (no identities) links to Log in instead", async () => {
    fake.auth.signUp.mockResolvedValue({
      data: { user: { id: "x", identities: [] }, session: null },
      error: null,
    });
    render(<SignUpScreen load={fake.load} />);
    const user = await fill("learner@example.com", "correct-horse");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("There's already an account with this email.");
    expect(screen.getByRole("link", { name: "Log in instead" })).toHaveAttribute("href", "/log-in");
  });

  it("criterion 7: no session → Check your inbox with Back to Learn", async () => {
    fake.auth.signUp.mockResolvedValue({
      data: { user: { id: "x", identities: [{}] }, session: null },
      error: null,
    });
    render(<SignUpScreen load={fake.load} />);
    const user = await fill("learner@example.com", "correct-horse");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByRole("heading", { name: "Check your inbox" })).toHaveFocus();
    expect(
      screen.getByText(
        "Open the link we sent to learner@example.com to finish creating your account.",
      ),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Back to Learn" })).toHaveAttribute("href", "/");
    expect(sessionStore.getState().status).toBe("signed-out");
  });

  it("criterion 11: a session is stored, then the same-origin next path opens", async () => {
    window.history.replaceState({}, "", "/sign-up?next=%2Fprofile");
    fake.auth.signUp.mockResolvedValue({ data: { session: fakeSession() }, error: null });
    render(<SignUpScreen load={fake.load} />);
    const user = await fill("learner@example.com", "correct-horse");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/profile"));
    expect(sessionStore.getState().status).toBe("signed-in");
    expect(fake.auth.signUp.mock.calls[0]![0].options.emailRedirectTo).toBe(
      "http://localhost:3000/auth/callback?next=%2Fprofile",
    );
  });

  it("ignores a next that is not a same-origin path", async () => {
    window.history.replaceState({}, "", "/sign-up?next=https%3A%2F%2Fevil.example");
    fake.auth.signUp.mockResolvedValue({ data: { session: fakeSession() }, error: null });
    render(<SignUpScreen load={fake.load} />);
    const user = await fill("learner@example.com", "correct-horse");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });

  it("criterion 8: offline shows the message and disables the button", async () => {
    onLine.mockReturnValue(false);
    render(<SignUpScreen load={fake.load} />);
    expect(
      screen.getByText("You're offline. Connect to the internet to sign up or log in."),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Create account" })).toBeDisabled();
    act(() => {
      onLine.mockReturnValue(true);
      window.dispatchEvent(new Event("online"));
    });
    expect(screen.getByRole("button", { name: "Create account" })).toBeEnabled();
  });

  it("a signed-in learner is sent to Learn", () => {
    sessionStore.setState({ status: "signed-in", user: { id: "u", email: null } });
    render(<SignUpScreen load={fake.load} />);
    expect(replace).toHaveBeenCalledWith("/");
  });
});

describe("/log-in (PLT-010)", () => {
  beforeEach(() => window.history.replaceState({}, "", "/log-in"));

  it("criterion 6/9: fields, button, current-password, no Forgot password link yet", () => {
    render(<LogInScreen load={fake.load} />);
    expect(screen.getByRole("heading", { level: 1, name: "Welcome back" })).toBeVisible();
    expect(passwordField()).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("button", { name: "Log in" })).toBeEnabled();
    expect(screen.queryByRole("link", { name: "Forgot password?" })).toBeNull();
  });

  it("criterion 6: wrong credentials never say which one", async () => {
    fake.auth.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { code: "invalid_credentials", status: 400, message: "Invalid login credentials" },
    });
    render(<LogInScreen load={fake.load} />);
    const user = await fill("learner@example.com", "wrong-password");
    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That email and password don't match.",
    );
    expect(screen.queryByText("Invalid login credentials")).toBeNull();
  });

  it("criterion 4: Logging in… while sending", async () => {
    fake.auth.signInWithPassword.mockReturnValue(new Promise(() => {}));
    render(<LogInScreen load={fake.load} />);
    const user = await fill("learner@example.com", "pw");
    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByRole("button", { name: "Logging in…" })).toBeDisabled();
  });

  it("criterion 11: success stores the session and goes to /", async () => {
    fake.auth.signInWithPassword.mockResolvedValue({
      data: { session: fakeSession({ email: "me@example.com" }) },
      error: null,
    });
    render(<LogInScreen load={fake.load} />);
    const user = await fill("me@example.com", "correct-horse");
    await user.click(screen.getByRole("button", { name: "Log in" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(sessionStore.getState().user?.email).toBe("me@example.com");
  });

  it("criterion 8: offline disables Log in", () => {
    onLine.mockReturnValue(false);
    render(<LogInScreen load={fake.load} />);
    expect(screen.getByRole("button", { name: "Log in" })).toBeDisabled();
  });
});

describe("/auth/callback (ADR-020 §3)", () => {
  it("exchanges the code once, stores the session and follows a safe next", async () => {
    window.history.replaceState({}, "", "/auth/callback?code=abc&next=%2Fprofile");
    fake.auth.exchangeCodeForSession.mockResolvedValue({
      data: { session: fakeSession() },
      error: null,
    });
    render(<AuthCallbackScreen load={fake.load} />);
    expect(screen.getByRole("status")).toHaveTextContent("Signing you in…");
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/profile"));
    expect(fake.auth.exchangeCodeForSession).toHaveBeenCalledTimes(1);
    expect(fake.auth.exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(sessionStore.getState().status).toBe("signed-in");
  });

  it("never follows an off-site next (open-redirect guard)", async () => {
    window.history.replaceState({}, "", "/auth/callback?code=abc&next=%2F%2Fevil.example");
    fake.auth.exchangeCodeForSession.mockResolvedValue({
      data: { session: fakeSession() },
      error: null,
    });
    render(<AuthCallbackScreen load={fake.load} />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });

  it.each(["/auth/callback?error=access_denied", "/auth/callback"])(
    "%s shows the expired-link copy",
    async (url) => {
      window.history.replaceState({}, "", url);
      render(<AuthCallbackScreen load={fake.load} />);
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "This link has expired. Request a new one.",
      );
      expect(fake.auth.exchangeCodeForSession).not.toHaveBeenCalled();
    },
  );

  it("a failed exchange shows the expired-link copy", async () => {
    window.history.replaceState({}, "", "/auth/callback?code=used");
    fake.auth.exchangeCodeForSession.mockResolvedValue({
      data: { session: null },
      error: { code: "flow_state_not_found", status: 404 },
    });
    render(<AuthCallbackScreen load={fake.load} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("This link has expired.");
    expect(replace).not.toHaveBeenCalled();
  });
});
