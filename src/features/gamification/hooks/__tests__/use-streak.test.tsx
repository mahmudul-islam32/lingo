import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createFullHearts, useStreak } from "@/features/gamification";
import { queryKeys } from "@/lib/query";
import { createQueryWrapper, createTestQueryClient } from "@/lib/query/testing";
import { makeResult } from "../../rules/__tests__/fixtures";
import { createStubSession, pending } from "./session-stub";

const mocks = vi.hoisted(() => ({ session: null as unknown }));
vi.mock("@/lib/offline", () => ({ getLocalSession: async () => mocks.session }));

const COURSE = "es-en";
const DAY = 24 * 60 * 60 * 1000;

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** A client pre-filled with the raw facts, so no read runs (the hook does none of its own). */
function seededClient(localDates: string[], now: Date) {
  const client = createTestQueryClient();
  client.setQueryData(
    queryKeys.progress(COURSE),
    localDates.map((localDate) => makeResult({ courseId: COURSE, localDate })),
  );
  client.setQueryData(queryKeys.hearts(), createFullHearts(now));
  client.setQueryData(queryKeys.settings(), null);
  return client;
}

describe("useStreak (GAM-004 AC4, AC5, AC8)", () => {
  it.each([
    // [timezone, 30 s before local midnight on 2026-11-07 (UTC)]
    ["Europe/Berlin", "2026-11-07T22:59:30.000Z"],
    ["America/Los_Angeles", "2026-11-08T07:59:30.000Z"],
  ])(
    "%s: extended → at_risk at midnight → broken a day later, no reload",
    async (timeZone, beforeMidnight) => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
      const now = new Date(beforeMidnight);
      vi.setSystemTime(now);
      const session = createStubSession();
      mocks.session = session;
      const client = seededClient(["2026-11-06", "2026-11-07"], now);

      const { result } = renderHook(() => useStreak(COURSE, { timeZone }), {
        wrapper: createQueryWrapper(client),
      });
      expect(result.current).toMatchObject({
        status: "success",
        streakStatus: "extended",
        streak: { current: 2, extendedToday: true },
      });

      await act(async () => vi.advanceTimersByTime(30_000));
      expect(result.current).toMatchObject({
        streakStatus: "at_risk",
        streak: { current: 2, extendedToday: false },
      });

      await act(async () => vi.advanceTimersByTime(DAY));
      expect(result.current).toMatchObject({
        streakStatus: "broken",
        streak: { current: 0, longest: 2 },
      });

      // AC4: no second read of the results (all data came from the cache).
      expect(session.progress.listLessonResults).not.toHaveBeenCalled();
    },
  );

  it("is 'none' for a new learner", () => {
    const now = new Date("2026-11-07T12:00:00.000Z");
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(now);
    const { result } = renderHook(() => useStreak(COURSE, { timeZone: "UTC" }), {
      wrapper: createQueryWrapper(seededClient([], now)),
    });
    expect(result.current.streakStatus).toBe("none");
  });

  it("passes loading and error through from useUserProgress", async () => {
    const session = createStubSession();
    mocks.session = session;
    session.progress.listLessonResults.mockReturnValueOnce(pending());
    session.progress.getHearts.mockResolvedValue(createFullHearts(new Date()));
    session.profile.findSettings.mockResolvedValue(null);
    const loading = renderHook(() => useStreak(COURSE), { wrapper: createQueryWrapper() });
    expect(loading.result.current).toEqual({ status: "loading", streak: null, streakStatus: null });

    session.progress.listLessonResults.mockRejectedValue(new Error("quota"));
    const failed = renderHook(() => useStreak(COURSE), { wrapper: createQueryWrapper() });
    await waitFor(() =>
      expect(failed.result.current).toEqual({ status: "error", streak: null, streakStatus: null }),
    );
  });
});
