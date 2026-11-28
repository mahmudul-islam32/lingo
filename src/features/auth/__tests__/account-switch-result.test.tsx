import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLocalSession, resetLocalSession } from "@/lib/offline";
import { lessonResult } from "@/lib/offline/__tests__/helpers";
import { createFakeAuthClient, fakeSession } from "@/lib/supabase/testing";
import { resetAccountSwitchForTests } from "../account-switch";
import { AccountSwitchResult } from "../components/AccountSwitchResult";
import { LogInScreen } from "../components/LogInScreen";
import { sessionStore } from "../session-store";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace, prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
}));

beforeEach(() => {
  replace.mockReset();
  resetAccountSwitchForTests();
  resetLocalSession();
  window.localStorage.clear();
  sessionStore.setState({ ready: true, status: "signed-out", user: null });
  window.history.replaceState({}, "", "/log-in");
});
afterEach(() => vi.restoreAllMocks());

describe("AccountSwitchResult (PLT-013 criteria 6 and 8)", () => {
  it("saved: a calm status with Continue to next", () => {
    render(<AccountSwitchResult outcome={{ kind: "saved" }} next="/profile" onRetry={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent("Your progress is saved.");
    expect(screen.getByRole("heading", { level: 1 })).toHaveFocus();
    expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute("href", "/profile");
  });

  it("failed: the reassuring copy and Try again", async () => {
    const onRetry = vi.fn();
    render(
      <AccountSwitchResult
        outcome={{ kind: "failed", reason: "network" }}
        next="/"
        onRetry={onRetry}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't save your progress yet. It's safe on this device.",
    );
    await userEvent.setup().click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("link", { name: "Back to Learn" })).toHaveAttribute("href", "/");
  });
});

describe("log-in with progress to save", () => {
  it("shows the failure state when the upload can't run, and the guest keeps its data", async () => {
    const local = await getLocalSession();
    await local.profile.updateSettings({ courseId: "en-de", dailyGoalXp: 20 });
    await local.progress.saveLessonResult(lessonResult({ courseId: "en-de" }));
    const fake = createFakeAuthClient();
    fake.auth.signInWithPassword.mockResolvedValue({
      data: { session: fakeSession() },
      error: null,
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<LogInScreen load={fake.load} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "me@example.com");
    await user.type(screen.getByLabelText("Password"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("button", { name: "Try again" })).toBeVisible();
    expect(replace).not.toHaveBeenCalled();
    expect((await local.profile.getIdentity()).kind).toBe("guest");
    await waitFor(async () => expect(await local.account.listAllLessonResults()).toHaveLength(1));
  });

  it("a guest without results is adopted and goes straight to Learn", async () => {
    const local = await getLocalSession();
    await local.profile.updateSettings({ courseId: "en-de", dailyGoalXp: 20 });
    const fake = createFakeAuthClient();
    fake.auth.signInWithPassword.mockResolvedValue({
      data: { session: fakeSession() },
      error: null,
    });
    render(<LogInScreen load={fake.load} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "me@example.com");
    await user.type(screen.getByLabelText("Password"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Log in" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect((await local.profile.getIdentity()).kind).toBe("account");
  });
});
