import { act, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { goalPlanFor, type Settings } from "@/contracts";
import { ToastProvider } from "@/components/ui";
import { createGuestProfileStore, guestProfileStore } from "@/features/profile";
import { openLocalSession } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import { createQueryWrapper, createTestQueryClient } from "@/lib/query/testing";
import {
  DAILY_GOAL_CHANGE_ERROR,
  dailyGoalSetToast,
  useGoalPlanActions,
} from "./use-goal-plan-actions";

async function setup() {
  const opened = openLocalSession({ forceMemory: true });
  const store = createGuestProfileStore({ loadSession: () => opened });
  await store.getState().init();
  const session = await opened;
  const settings = await session.profile.updateSettings({
    courseId: "en-de",
    dailyGoalXp: 10,
    goalPlanUpdate: {
      courseId: "en-de",
      goalPlan: { targetLevel: "A2", targetDate: "2027-03-12" },
    },
  });
  guestProfileStore.setState({ updateSettings: store.getState().updateSettings });
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.settings(), settings);
  const QueryWrapper = createQueryWrapper(client);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryWrapper>
      <ToastProvider>{children}</ToastProvider>
    </QueryWrapper>
  );
  const hook = renderHook(() => useGoalPlanActions(), { wrapper });
  return { hook, client, session };
}

describe("Learn goal-plan actions (PLT-027 AC 11)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("11: 'Use 20 XP a day' saves the daily goal, updates the cache and toasts", async () => {
    const { hook, client, session } = await setup();
    await act(() => hook.result.current.onUseSuggestedGoal(20));
    expect((await session.profile.getSettings())?.dailyGoalXp).toBe(20);
    const cached = client.getQueryData<Settings>(queryKeys.settings());
    expect(cached?.dailyGoalXp).toBe(20);
    // The plan is untouched.
    expect(cached && goalPlanFor(cached, "en-de")).toEqual({
      targetLevel: "A2",
      targetDate: "2027-03-12",
    });
    expect(await screen.findByText(dailyGoalSetToast(20))).toHaveTextContent(
      "Daily goal set to 20 XP.",
    );
  });

  it("11: a failed save toasts the error and changes nothing", async () => {
    const { hook, client, session } = await setup();
    guestProfileStore.setState({ updateSettings: vi.fn().mockRejectedValue(new Error("x")) });
    await act(() => hook.result.current.onUseSuggestedGoal(30));
    expect(await screen.findByText(DAILY_GOAL_CHANGE_ERROR)).toBeInTheDocument();
    expect((await session.profile.getSettings())?.dailyGoalXp).toBe(10);
    expect(client.getQueryData<Settings>(queryKeys.settings())?.dailyGoalXp).toBe(10);
  });
});
