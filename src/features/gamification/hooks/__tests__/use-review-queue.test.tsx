import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CourseSchema, type Course, type LessonResult, type Settings } from "@/contracts";
import { REVIEW_QUEUE_READ_WARNING, useReviewQueue } from "@/features/gamification";
import { queryKeys } from "@/lib/query";
import { createQueryWrapper, createTestQueryClient } from "@/lib/query/testing";
import enDeCourse from "../../../../../content/courses/en-de/course.json";
import telcCourse from "../../../../../content/courses/telc-b1-en-de/course.json";
import { makeOutcomeResult } from "../../rules/__tests__/fixtures";
import { createStubSession, pending, type StubSession } from "./session-stub";

const mocks = vi.hoisted(() => ({ session: null as unknown }));
vi.mock("@/lib/offline", () => ({ getLocalSession: async () => mocks.session }));

const COURSE = "en-de";
const TELC = "telc-b1-en-de";
const DE: Course = CourseSchema.parse(enDeCourse);
const TB1: Course = CourseSchema.parse(telcCourse);
const L1 = DE.units[0]!.lessons[0]!.id;
const T1 = TB1.units[0]!.lessons[0]!.id;

let session: StubSession;
beforeEach(() => {
  session = createStubSession();
  mocks.session = session;
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const settings = (courseId = COURSE): Settings => ({
  courseId,
  dailyGoalXp: 20,
  soundEffectsEnabled: true,
  speakingExercisesEnabled: true,
  updatedAt: "2026-11-21T08:00:00.000Z",
});

const answer = (
  exerciseId: string,
  date: string,
  outcome: "correct" | "incorrect",
  courseId = COURSE,
  lessonId = L1,
): LessonResult =>
  makeOutcomeResult({ courseId, lessonId, date, outcomes: [[exerciseId, outcome]] });

function seeded(results: LessonResult[], s: Settings = settings()) {
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.settings(), s);
  client.setQueryData(queryKeys.progress(COURSE), results);
  client.setQueryData(queryKeys.content(COURSE), DE);
  return client;
}

function render(client: ReturnType<typeof createTestQueryClient>, courseId?: string) {
  return renderHook(() => useReviewQueue({ timeZone: "UTC", ...(courseId ? { courseId } : {}) }), {
    wrapper: createQueryWrapper(client),
  });
}

describe("useReviewQueue (GAM-015 AC8)", () => {
  it("returns the selection of the active course", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-12-10T12:00:00.000Z"));
    const { result } = render(
      seeded([answer("ex-a", "2026-12-09", "incorrect"), answer("ex-c", "2026-12-09", "correct")]),
    );
    expect(result.current).toEqual({
      status: "success",
      candidates: [
        { lessonId: L1, exerciseId: "ex-a" },
        { lessonId: L1, exerciseId: "ex-c" },
      ],
      dueCount: 2,
      eligibleCount: 2,
    });
  });

  it("no history: success with zero counts (PD-080)", () => {
    expect(render(seeded([])).result.current).toEqual({
      status: "success",
      candidates: [],
      dueCount: 0,
      eligibleCount: 0,
    });
  });

  it("reads the given course, or the active one when none is given", () => {
    const client = seeded([answer("ex-a", "2026-12-09", "incorrect")], settings(TELC));
    client.setQueryData(queryKeys.progress(TELC), [
      answer("ex-t", "2026-12-09", "incorrect", TELC, T1),
    ]);
    client.setQueryData(queryKeys.content(TELC), TB1);
    expect(render(client).result.current.candidates).toEqual([
      { lessonId: T1, exerciseId: "ex-t" },
    ]);
    expect(render(client, COURSE).result.current.candidates).toEqual([
      { lessonId: L1, exerciseId: "ex-a" },
    ]);
  });

  it("loading while results or the course load", () => {
    session.profile.findSettings.mockReturnValue(pending());
    session.progress.listLessonResults.mockReturnValue(pending());
    expect(render(createTestQueryClient()).result.current).toEqual({
      status: "loading",
      candidates: [],
      dueCount: 0,
      eligibleCount: 0,
    });
    const noResults = createTestQueryClient();
    noResults.setQueryData(queryKeys.settings(), settings());
    noResults.setQueryData(queryKeys.content(COURSE), DE);
    expect(render(noResults).result.current.status).toBe("loading");
  });

  it("works from the local session (guest, offline)", async () => {
    session.profile.findSettings.mockResolvedValue(settings());
    session.progress.listLessonResults.mockResolvedValue([
      answer("ex-a", "2026-11-01", "incorrect"),
    ]);
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.content(COURSE), DE);
    const { result } = render(client);
    await waitFor(() => expect(result.current).toMatchObject({ status: "success", dueCount: 1 }));
  });

  it("updates without a reload after a result is saved", async () => {
    const client = seeded([]);
    const { result } = render(client);
    expect(result.current.eligibleCount).toBe(0);
    act(() =>
      client.setQueryData(queryKeys.progress(COURSE), [answer("ex-a", "2026-11-01", "incorrect")]),
    );
    await waitFor(() => expect(result.current).toMatchObject({ eligibleCount: 1, dueCount: 1 }));

    session.progress.listLessonResults.mockResolvedValue([
      answer("ex-a", "2026-11-01", "incorrect"),
      answer("ex-b", "2026-11-01", "incorrect"),
    ]);
    await act(() => client.invalidateQueries({ queryKey: queryKeys.progress(COURSE) }));
    await waitFor(() => expect(result.current).toMatchObject({ eligibleCount: 2, dueCount: 2 }));
  });

  it("updates at local midnight: a correct answer becomes due the next day", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    vi.setSystemTime(new Date("2026-12-09T23:59:30.000Z"));
    const { result } = render(seeded([answer("ex-b", "2026-12-09", "correct")]));
    expect(result.current).toMatchObject({ dueCount: 0, eligibleCount: 1 });
    await act(async () => vi.advanceTimersByTime(60_000));
    expect(result.current).toMatchObject({ dueCount: 1, eligibleCount: 1 });
  });

  it("a read error is logged once and gives status error", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const failure = new Error("dexie down");
    session.profile.findSettings.mockResolvedValue(settings());
    session.progress.listLessonResults.mockRejectedValue(failure);
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.content(COURSE), DE);
    const { result, rerender } = render(client);
    await waitFor(() => expect(result.current.status).toBe("error"));
    rerender();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(REVIEW_QUEUE_READ_WARNING, failure);
    expect(result.current).toMatchObject({ candidates: [], dueCount: 0, eligibleCount: 0 });
  });
});
