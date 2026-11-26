import { act, screen, waitFor } from "@testing-library/react";
import type { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GoalPlan, Settings } from "@/contracts";
import { ToastProvider } from "@/components/ui";
import { createGuestProfileStore, guestProfileStore } from "@/features/profile";
import { openLocalSession, type LocalSession } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { LearnScreen } from "./LearnScreen";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
}));

const PLAN: GoalPlan = { targetLevel: "A2", targetDate: "2099-03-12" };

let session: LocalSession;

/** Learn on a memory session with the given course and (optional) saved goal plan. */
async function renderLearn(initial: Partial<Settings>) {
  const opened = openLocalSession({ forceMemory: true });
  const store = createGuestProfileStore({ loadSession: () => opened });
  await store.getState().init();
  session = await opened;
  const settings = await session.profile.updateSettings({ dailyGoalXp: 10, ...initial });
  guestProfileStore.setState({
    status: "ready",
    onboardingComplete: true,
    updateSettings: store.getState().updateSettings,
  });
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.settings(), settings);
  renderWithQueryClient(
    <ToastProvider>
      <LearnScreen />
    </ToastProvider>,
    { client },
  );
  return { client };
}

/** Waits until the course is known (its content query has data) and Learn re-rendered. */
async function courseLoaded(client: QueryClient, courseId: string) {
  await waitFor(
    () => expect(client.getQueryState(queryKeys.content(courseId))?.status).toBe("success"),
    { timeout: 5000 },
  );
  // The progress and settings reads settle too, so nothing appears afterwards.
  await act(async () => {});
  await screen.findByRole("button", { name: "Hearts: 5 of 5" });
}

function expectNoGoalDateUi() {
  expect(screen.queryByRole("link", { name: "Set a goal date" })).not.toBeInTheDocument();
  expect(screen.queryByTestId("goal-plan-empty")).not.toBeInTheDocument();
  expect(screen.queryByTestId("goal-plan-card")).not.toBeInTheDocument();
}

describe("Learn goal-date UI on courses without levels (FIX-014)", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(["en-es", "einbuergerung-en-de"])(
    "1: %s shows no goal-date link, empty state or card without a plan",
    async (courseId) => {
      const { client } = await renderLearn({ courseId });
      await courseLoaded(client, courseId);
      expectNoGoalDateUi();
    },
  );

  it.each(["en-es", "einbuergerung-en-de"])(
    "1: %s shows no goal-date UI with a saved plan either",
    async (courseId) => {
      const { client } = await renderLearn({ courseId, goalPlan: PLAN });
      await courseLoaded(client, courseId);
      expectNoGoalDateUi();
    },
  );

  it("2: en-de still shows the 'Set a goal date' link without a plan", async () => {
    await renderLearn({ courseId: "en-de" });
    expect(await screen.findByRole("link", { name: "Set a goal date" })).toBeInTheDocument();
  });

  it("2: en-de still shows the goal-date card with a plan", async () => {
    await renderLearn({ courseId: "en-de", goalPlan: PLAN });
    expect(await screen.findByTestId("goal-plan-card")).toBeInTheDocument();
  });

  it("4: a course without levels keeps the saved plan; back on en-de the card returns", async () => {
    const { client } = await renderLearn({ courseId: "einbuergerung-en-de", goalPlan: PLAN });
    await courseLoaded(client, "einbuergerung-en-de");
    expectNoGoalDateUi();
    expect((await session.profile.getSettings())?.goalPlan).toEqual(PLAN);

    const back = await session.profile.updateSettings({ courseId: "en-de" });
    await act(async () => {
      client.setQueryData(queryKeys.settings(), back);
    });
    expect(await screen.findByTestId("goal-plan-card")).toBeInTheDocument();
    await waitFor(async () =>
      expect((await session.profile.getSettings())?.goalPlan).toEqual(PLAN),
    );
  });
});
