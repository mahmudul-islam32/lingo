import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GAME_CONFIG,
  HeartsStateSchema,
  SettingsSchema,
  UserProgressSchema,
  type Settings,
} from "@/contracts";
import {
  createFullHearts,
  heartsQuery,
  progressQuery,
  settingsQuery,
  useProgressInputs,
  useUserProgress,
} from "@/features/gamification";
import { queryKeys } from "@/lib/query";
import { createQueryWrapper, createTestQueryClient } from "@/lib/query/testing";
import { makeResult } from "../../rules/__tests__/fixtures";
import { createStubSession, pending, type StubSession } from "./session-stub";

const mocks = vi.hoisted(() => ({ session: null as unknown }));
vi.mock("@/lib/offline", () => ({ getLocalSession: async () => mocks.session }));

const COURSE = "es-en";
const TZ = "Europe/Berlin";
const NOW = new Date("2026-11-07T12:00:00.000Z");
const SETTINGS: Settings = SettingsSchema.parse({
  courseId: COURSE,
  dailyGoalXp: 50,
  soundEffectsEnabled: true,
  speakingExercisesEnabled: true,
  updatedAt: "2026-11-01T00:00:00.000Z",
});

let session: StubSession;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  session = createStubSession();
  mocks.session = session;
  session.progress.listLessonResults.mockResolvedValue([]);
  session.progress.getHearts.mockResolvedValue(createFullHearts(NOW));
  session.profile.findSettings.mockResolvedValue(SETTINGS);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function setup() {
  const client = createTestQueryClient();
  const hook = renderHook(() => useUserProgress(COURSE, { timeZone: TZ }), {
    wrapper: createQueryWrapper(client),
  });
  return { client, ...hook };
}

describe("query factories (ADR-005)", () => {
  it("use the shared keys and cache raw repository facts", async () => {
    expect(progressQuery(COURSE).queryKey).toEqual(queryKeys.progress(COURSE));
    expect(heartsQuery().queryKey).toEqual(queryKeys.hearts());
    expect(settingsQuery().queryKey).toEqual(queryKeys.settings());

    const client = createTestQueryClient();
    const results = [makeResult()];
    session.progress.listLessonResults.mockResolvedValue(results);
    await expect(client.fetchQuery(progressQuery(COURSE))).resolves.toBe(results);
    expect(session.progress.listLessonResults).toHaveBeenCalledWith(COURSE);
    await expect(client.fetchQuery(heartsQuery())).resolves.toEqual(createFullHearts(NOW));
    await expect(client.fetchQuery(settingsQuery())).resolves.toBe(SETTINGS);
  });
});

describe("useUserProgress (GAM-003 AC9–AC11, AC13)", () => {
  it("goes loading → success with the derived progress", async () => {
    session.progress.listLessonResults.mockResolvedValue([
      makeResult({ courseId: COURSE, localDate: "2026-11-07" }),
    ]);
    const { result, client } = setup();
    expect(result.current).toEqual({ status: "loading", progress: null });

    await waitFor(() => expect(result.current.status).toBe("success"));
    const progress = UserProgressSchema.parse(result.current.progress);
    expect(progress).toMatchObject({
      totalXp: 15,
      lessonsCompletedCount: 1,
      dailyGoal: { earnedXp: 15, goalXp: 50, localDate: "2026-11-07" },
      streak: { current: 1, extendedToday: true },
    });
    // ADR-005: the cache holds the raw results, not a derived shape.
    expect(Array.isArray(client.getQueryData(queryKeys.progress(COURSE)))).toBe(true);
  });

  it("is a new learner's empty progress with no results", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.progress).toMatchObject({
      totalXp: 0,
      lessonsCompletedCount: 0,
      streak: { current: 0 },
      hearts: { current: GAME_CONFIG.maxHearts },
      dailyGoal: { earnedXp: 0 },
    });
  });

  it("re-derives when ['progress', courseId] is invalidated (lesson finished)", async () => {
    const { result, client } = setup();
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.progress?.totalXp).toBe(0);

    session.progress.listLessonResults.mockResolvedValue([
      makeResult({ courseId: COURSE, lessonId: "lesson-1", localDate: "2026-11-07" }),
      makeResult({ courseId: COURSE, lessonId: "lesson-1", localDate: "2026-11-07" }),
    ]);
    await act(() => client.invalidateQueries({ queryKey: queryKeys.progress(COURSE) }));
    await waitFor(() => expect(result.current.progress?.totalXp).toBe(30));
    expect(result.current.progress?.lessonsCompletedCount).toBe(1);
  });

  it("re-derives when ['hearts'] is invalidated", async () => {
    const { result, client } = setup();
    await waitFor(() => expect(result.current.status).toBe("success"));
    session.progress.getHearts.mockResolvedValue(
      HeartsStateSchema.parse({
        current: 2,
        refillStartedAt: NOW.toISOString(),
        updatedAt: NOW.toISOString(),
      }),
    );
    await act(() => client.invalidateQueries({ queryKey: queryKeys.hearts() }));
    await waitFor(() => expect(result.current.progress?.hearts.current).toBe(2));
  });

  it("uses the default goal before onboarding saved one (AC10)", async () => {
    session.profile.findSettings.mockResolvedValue(null);
    const { result } = setup();
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.progress?.dailyGoal.goalXp).toBe(GAME_CONFIG.defaultDailyGoalXp);
  });

  it("falls back to the default goal when settings can't be read", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    session.profile.findSettings.mockRejectedValue(new Error("corrupt"));
    const { result } = setup();
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.progress?.dailyGoal.goalXp).toBe(GAME_CONFIG.defaultDailyGoalXp);
  });

  it("stays loading while settings are still being read", async () => {
    session.profile.findSettings.mockReturnValue(pending());
    const { result } = setup();
    await act(async () => {});
    expect(result.current.status).toBe("loading");
  });

  it("returns status 'error' without throwing when results can't be read (AC11)", async () => {
    session.progress.listLessonResults.mockRejectedValue(new Error("quota"));
    const { result } = setup();
    await waitFor(() => expect(result.current).toEqual({ status: "error", progress: null }));
  });

  it("hearts fail, results OK → success with full hearts (GAM-003 AC15, FIX-003 AC2)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    session.progress.listLessonResults.mockResolvedValue([
      makeResult({ courseId: COURSE, lessonId: "lesson-1", localDate: "2026-11-06" }),
      makeResult({ courseId: COURSE, lessonId: "lesson-2", localDate: "2026-11-07" }),
    ]);
    session.progress.getHearts.mockRejectedValue(new Error("corrupt"));
    const { result, client, rerender } = setup();

    await waitFor(() => expect(result.current.status).toBe("success"));
    const progress = UserProgressSchema.parse(result.current.progress);
    expect(progress).toMatchObject({
      totalXp: 30,
      completedLessonIds: ["lesson-1", "lesson-2"],
      streak: { current: 2, extendedToday: true },
      dailyGoal: { earnedXp: 15, goalXp: 50, localDate: "2026-11-07" },
      hearts: { current: GAME_CONFIG.maxHearts },
    });

    // AC3: one warning per failed read, not per render.
    rerender();
    rerender();
    expect(warn).toHaveBeenCalledTimes(1);
    // AC4: the fallback is neither saved nor cached (ADR-005).
    expect(session.progress.saveHearts).not.toHaveBeenCalled();
    expect(client.getQueryData(queryKeys.hearts())).toBeUndefined();
  });

  it("warns once more for a second failed hearts read (FIX-003 AC3)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    session.progress.getHearts.mockRejectedValue(new Error("corrupt"));
    const { result, client } = setup();
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(warn).toHaveBeenCalledTimes(1);

    vi.setSystemTime(NOW.getTime() + 1000);
    await act(() => client.invalidateQueries({ queryKey: queryKeys.hearts() }));
    await waitFor(() => expect(warn).toHaveBeenCalledTimes(2));
    expect(result.current.status).toBe("success");
  });

  it("several hooks on one failed hearts read log one warning (FIX-003 AC3)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    session.progress.getHearts.mockRejectedValue(new Error("corrupt"));
    const client = createTestQueryClient();
    const { result } = renderHook(
      () => [useUserProgress(COURSE, { timeZone: TZ }), useUserProgress(COURSE, { timeZone: TZ })],
      { wrapper: createQueryWrapper(client) },
    );
    await waitFor(() =>
      expect(result.current.map((p) => p.status)).toEqual(["success", "success"]),
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("results fail and hearts fail → error (AC11, FIX-003 AC5)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    session.progress.listLessonResults.mockRejectedValue(new Error("quota"));
    session.progress.getHearts.mockRejectedValue(new Error("corrupt"));
    const { result } = setup();
    await waitFor(() => expect(result.current).toEqual({ status: "error", progress: null }));
  });
});

describe("useProgressInputs (raw inputs for LES-010)", () => {
  it("returns the stored results, stored hearts, goal and clock", async () => {
    const results = [makeResult({ courseId: COURSE })];
    const hearts = createFullHearts(NOW);
    session.progress.listLessonResults.mockResolvedValue(results);
    session.progress.getHearts.mockResolvedValue(hearts);
    const { result } = renderHook(() => useProgressInputs(COURSE, { timeZone: TZ }), {
      wrapper: createQueryWrapper(),
    });
    expect(result.current).toMatchObject({ status: "loading", results: null, hearts: null });
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current).toMatchObject({ results, hearts, goalXp: 50, today: "2026-11-07" });
    expect(result.current.now.toISOString()).toBe(NOW.toISOString());
  });

  it("hearts fail, results OK → success with full hearts and the real results (FIX-003 AC1)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const results = [makeResult({ courseId: COURSE })];
    session.progress.listLessonResults.mockResolvedValue(results);
    session.progress.getHearts.mockRejectedValue(new Error("corrupt"));
    const { result } = renderHook(() => useProgressInputs(COURSE, { timeZone: TZ }), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.results).toBe(results);
    expect(result.current.hearts).toEqual(createFullHearts(result.current.now));
  });

  it("keeps cached hearts when only a refetch of them fails", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const client = createTestQueryClient();
    const stored = HeartsStateSchema.parse({
      current: 2,
      refillStartedAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    });
    session.progress.getHearts.mockResolvedValue(stored);
    const { result } = renderHook(() => useProgressInputs(COURSE, { timeZone: TZ }), {
      wrapper: createQueryWrapper(client),
    });
    await waitFor(() => expect(result.current.status).toBe("success"));
    session.progress.getHearts.mockRejectedValue(new Error("corrupt"));
    await act(() => client.refetchQueries({ queryKey: queryKeys.hearts() }));
    await waitFor(() => expect(client.getQueryState(queryKeys.hearts())?.status).toBe("error"));
    expect(result.current).toMatchObject({ status: "success", hearts: stored });
  });
});
