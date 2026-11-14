import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui";
import { renderWithQueryClient } from "@/lib/query/testing";
import { navigationState } from "./navigation-mock";
import { guestProfileStore } from "@/features/profile";
import TabsLayout from "../../(tabs)/layout";
import LearnPage from "../../(tabs)/page";
import ProfilePage from "../../(tabs)/profile/page";
import RootError from "../../error";
import RootLoading from "../../loading";
import NotFound, { metadata as notFoundMetadata } from "../../not-found";
import OnboardingPage from "../../onboarding/page";
import TabsError from "../../(tabs)/error";
import TabsLoading from "../../(tabs)/loading";
import { APP_NAME, TITLE_TEMPLATE } from "../app-name";
import { SkipLink } from "../SkipLink";

function expectOneMainAndOneH1() {
  expect(screen.getAllByRole("main")).toHaveLength(1);
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
}

describe("app shell", () => {
  beforeEach(() => {
    navigationState.pathname = "/";
    // An onboarded learner, so the tabs' OnboardingGate (PLT-004) renders the page.
    guestProfileStore.setState({ status: "ready", onboardingComplete: true });
  });

  it("Learn: one main, one h1, bottom nav outside main, skip link first", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <ToastProvider>
        <SkipLink />
        <TabsLayout>
          <LearnPage />
        </TabsLayout>
      </ToastProvider>,
    );
    expectOneMainAndOneH1();
    const main = screen.getByRole("main");
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(main).not.toContainElement(nav);
    expect(main.className).toContain("env(safe-area-inset-bottom)");

    // PLT-009: top bar, then the skill path, then the bottom nav in the Tab order.
    // (jsdom has no IndexedDB: progress and hearts come from the in-memory fallback.)
    // The default course (en-de, CTO-008) is pm content: nodes are found by
    // "Unit N, Lesson M:" (GAM-010); the current level's header button comes first.
    const hearts = await screen.findByRole("button", { name: "Hearts: 5 of 5" });
    const level = await screen.findByRole("button", { name: /^A1 · /, expanded: true });
    const first = await screen.findByRole("link", { name: /^Unit 1, Lesson 1: .*, up next/ });
    const nodes = [
      ...screen.queryAllByRole("link", { name: /^Unit \d+, Lesson \d+: / }),
      ...screen.queryAllByRole("button", { name: /^Unit \d+, Lesson \d+: / }),
    ];
    const lastLesson = nodes
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      .at(-1)!;
    await user.tab();
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveFocus();
    await user.tab();
    expect(hearts).toHaveFocus();
    await user.tab();
    expect(level).toHaveFocus();
    await user.tab();
    expect(first).toHaveFocus();
    lastLesson.focus();
    await user.tab();
    expect(within(nav).getByRole("link", { name: "Learn" })).toHaveFocus();
  });

  it("Profile: one main, one h1, Profile tab active", () => {
    navigationState.pathname = "/profile";
    render(
      <TabsLayout>
        <ProfilePage />
      </TabsLayout>,
    );
    expectOneMainAndOneH1();
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("aria-current", "page");
  });

  it("onboarding: no bottom nav", () => {
    guestProfileStore.setState({ status: "ready", onboardingComplete: false });
    renderWithQueryClient(<OnboardingPage />);
    expectOneMainAndOneH1();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("404: message, Back to Learn link, no bottom nav", () => {
    render(<NotFound />);
    expectOneMainAndOneH1();
    expect(
      screen.getByRole("heading", { level: 1, name: "We couldn't find that page" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Learn" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(notFoundMetadata.title).toBe("Page not found");
  });

  it('loading UI is a role="status" named "Loading"', () => {
    render(<RootLoading />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("tabs loading UI renders inside the tabs layout's main, nav stays visible", () => {
    render(
      <TabsLayout>
        <TabsLoading />
      </TabsLayout>,
    );
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("builds titles as '<Page> · Polyglow' from the single app-name constant", () => {
    expect(APP_NAME).toBe("Polyglow");
    expect(TITLE_TEMPLATE.replace("%s", "Learn")).toBe("Learn · Polyglow");
  });
});

describe("error boundary", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('shows "Something went wrong" and "Try again" calls reset()', async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<RootError error={new Error("boom")} reset={reset} />);
    expectOneMainAndOneH1();
    expect(
      screen.getByRole("heading", { level: 1, name: "Something went wrong" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("never renders the error message or stack in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const error = new Error("secret internal detail");
    render(<TabsError error={error} reset={() => {}} />);
    expect(screen.queryByText(/secret internal detail/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-details")).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain("at ");
  });

  it("shows the message in development to help debugging", () => {
    vi.stubEnv("NODE_ENV", "development");
    render(<TabsError error={new Error("dev detail")} reset={() => {}} />);
    expect(screen.getByTestId("error-details")).toHaveTextContent("dev detail");
  });
});
