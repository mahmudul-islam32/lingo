import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { goalPlanFor, type GoalPlan } from "@/contracts";
import { openLocalSession } from "@/lib/offline";
import { createQueryWrapper, createTestQueryClient } from "@/lib/query/testing";
import { createGuestProfileStore, useSetCourse } from "..";

const germanPlan: GoalPlan = { targetLevel: "A2", targetDate: "2027-03-12" };
const telcPlan: GoalPlan = { targetLevel: "B1", targetDate: "2027-06-30" };

describe("useSetCourse and goal plans (PLT-028 AC 8)", () => {
  it("the switch's patch is only the course id: no plan is created, changed or deleted", async () => {
    const opened = openLocalSession({ forceMemory: true });
    const store = createGuestProfileStore({ loadSession: () => opened });
    await store.getState().init();
    const session = await opened;
    await session.profile.updateSettings({ courseId: "en-de", dailyGoalXp: 20 });
    await session.profile.updateSettings({
      goalPlanUpdate: { courseId: "en-de", goalPlan: germanPlan },
    });
    await session.profile.updateSettings({
      goalPlanUpdate: { courseId: "telc-b1-en-de", goalPlan: telcPlan },
    });
    const update = vi.spyOn(store.getState(), "updateSettings");
    store.setState({ updateSettings: update });

    const { result } = renderHook(() => useSetCourse(store), {
      wrapper: createQueryWrapper(createTestQueryClient()),
    });
    const switched = await act(() => result.current.mutateAsync("telc-b1-en-de"));

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({ courseId: "telc-b1-en-de" });
    expect(switched.goalPlans).toEqual({ "en-de": germanPlan, "telc-b1-en-de": telcPlan });
    expect(goalPlanFor(switched, "telc-b1-en-de")).toEqual(telcPlan);

    const back = await act(() => result.current.mutateAsync("en-de"));
    expect(update).toHaveBeenLastCalledWith({ courseId: "en-de" });
    expect(back.goalPlans).toEqual({ "en-de": germanPlan, "telc-b1-en-de": telcPlan });
  });
});
