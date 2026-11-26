import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CourseSchema, type Course, type LessonResult, type Settings } from "@/contracts";
import { toLocalDate, useGoalPlan } from "@/features/gamification";
import { queryKeys } from "@/lib/query";
import { createQueryWrapper, createTestQueryClient } from "@/lib/query/testing";
import enDeCourse from "../../../../../content/courses/en-de/course.json";
import { makeOutcomeResult, makeResult } from "../../rules/__tests__/fixtures";
import { GOAL_PLAN_READ_WARNING } from "../use-goal-plan";
import { createStubSession, pending, type StubSession } from "./session-stub";

const mocks = vi.hoisted(() => ({ session: null as unknown }));
vi.mock("@/lib/offline", () => ({ getLocalSession: async () => mocks.session }));

const COURSE = "en-de";
const TZ = "UTC";
const DE: Course = CourseSchema.parse(enDeCourse);
const A1 = DE.units.filter((u) => u.level === "A1").flatMap((u) => u.lessons.map((l) => l.id));

let session: StubSession;
beforeEach(() => {
  session = createStubSession();
  mocks.session = session;
});
afterEach(() => vi.restoreAllMocks());

/** A target 100 days after the real today, so the test runs on any date. */
const today = () => toLocalDate(new Date(), TZ);
const inDays = (n: number) =>
  new Date(Date.parse(`${today()}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

const settings = (overrides: Partial<Settings> = {}): Settings => ({
  courseId: COURSE,
  dailyGoalXp: 20,
  soundEffectsEnabled: true,
  speakingExercisesEnabled: true,
  updatedAt: "2026-11-21T08:00:00.000Z",
  goalPlan: { targetLevel: "A1", targetDate: inDays(100) },
  ...overrides,
});
const done = (lessonId: string): LessonResult => makeResult({ courseId: COURSE, lessonId });

function seeded(s: Settings | null, results: LessonResult[] = []) {
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.settings(), s);
  client.setQueryData(queryKeys.progress(COURSE), results);
  client.setQueryData(queryKeys.content(COURSE), DE);
  return client;
}

function renderGoalPlan(client = createTestQueryClient()) {
  const view = renderHook(() => useGoalPlan({ timeZone: TZ }), {
    wrapper: createQueryWrapper(client),
  });
  return { ...view, client };
}

describe("useGoalPlan (GAM-013 AC8)", () => {
  it("returns the status from settings, results and today", () => {
    const { result } = renderGoalPlan(seeded(settings(), [done(A1[0]!), done(A1[0]!)]));
    expect(result.current).toEqual({
      targetLevel: "A1",
      targetDate: inDays(100),
      lessonsLeft: 59,
      daysLeft: 100,
      lessonsPerDay: 1,
      suggestedDailyGoalXp: 10,
      status: "on-track",
    });
  });

  it("null without a goal plan, before onboarding, or with a contentless target", () => {
    expect(renderGoalPlan(seeded(settings({ goalPlan: null }))).result.current).toBeNull();
    expect(renderGoalPlan(seeded(settings({ goalPlan: undefined }))).result.current).toBeNull();
    expect(renderGoalPlan(seeded(null)).result.current).toBeNull();
    const b1 = settings({ goalPlan: { targetLevel: "B1", targetDate: inDays(10) } });
    expect(renderGoalPlan(seeded(b1)).result.current).toBeNull();
  });

  it("uses the start level", () => {
    const plan = { targetLevel: "A2" as const, targetDate: inDays(70) };
    const { result } = renderGoalPlan(seeded(settings({ startLevel: "A2", goalPlan: plan })));
    expect(result.current).toMatchObject({ lessonsLeft: 70, lessonsPerDay: 1 });
  });

  it("undefined while loading (the card renders nothing)", () => {
    session.profile.findSettings.mockReturnValue(pending());
    session.progress.listLessonResults.mockReturnValue(pending());
    expect(renderGoalPlan().result.current).toBeUndefined();
  });

  it("undefined while results load when a plan exists", () => {
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.settings(), settings());
    client.setQueryData(queryKeys.content(COURSE), DE);
    session.progress.listLessonResults.mockReturnValue(pending());
    expect(renderGoalPlan(client).result.current).toBeUndefined();
  });

  it("reads from the local session (guest, offline): no network involved", async () => {
    session.profile.findSettings.mockResolvedValue(settings());
    session.progress.listLessonResults.mockResolvedValue([]);
    const { result } = renderGoalPlan();
    await waitFor(() => expect(result.current).toMatchObject({ lessonsLeft: 60 }));
  });

  it("updates without a reload after a lesson result, a goal change and a plan change", async () => {
    const { result, client } = renderGoalPlan(seeded(settings({ dailyGoalXp: 10 })));
    await waitFor(() =>
      expect(result.current).toMatchObject({ lessonsLeft: 60, status: "on-track" }),
    );

    act(() => client.setQueryData(queryKeys.progress(COURSE), [done(A1[0]!)]));
    await waitFor(() => expect(result.current).toMatchObject({ lessonsLeft: 59 }));

    const short = { targetLevel: "A1" as const, targetDate: inDays(30) };
    act(() =>
      client.setQueryData(queryKeys.settings(), settings({ dailyGoalXp: 10, goalPlan: short })),
    );
    await waitFor(() =>
      expect(result.current).toMatchObject({
        lessonsPerDay: 2,
        status: "raise-goal",
        suggestedDailyGoalXp: 20,
      }),
    );

    act(() =>
      client.setQueryData(queryKeys.settings(), settings({ dailyGoalXp: 20, goalPlan: short })),
    );
    await waitFor(() => expect(result.current).toMatchObject({ status: "on-track" }));

    act(() => client.setQueryData(queryKeys.settings(), settings({ goalPlan: null })));
    await waitFor(() => expect(result.current).toBeNull());
  });

  it("a read error returns null and is logged", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const failure = new Error("dexie down");
    session.profile.findSettings.mockResolvedValue(settings());
    session.progress.listLessonResults.mockRejectedValue(failure);
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.content(COURSE), DE);
    const { result } = renderGoalPlan(client);
    await waitFor(() => expect(warn).toHaveBeenCalledWith(GOAL_PLAN_READ_WARNING, failure));
    expect(result.current).toBeNull();
  });
});

describe("useGoalPlan with review results (GAM-015 AC7)", () => {
  it("a review result is not a completed lesson", () => {
    const review = makeOutcomeResult({
      courseId: COURSE,
      lessonId: A1[0]!,
      kind: "review",
      date: today(),
      outcomes: [["ex-1", "correct"]],
    });
    const { result } = renderGoalPlan(seeded(settings(), [review]));
    expect(result.current).toMatchObject({ lessonsLeft: 60 });
    const both = renderGoalPlan(seeded(settings(), [review, done(A1[0]!)]));
    expect(both.result.current).toMatchObject({ lessonsLeft: 59 });
  });
});
