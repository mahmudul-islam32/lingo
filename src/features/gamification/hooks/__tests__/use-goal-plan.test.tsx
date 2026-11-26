import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CourseSchema,
  type Course,
  type GoalPlan,
  type LessonResult,
  type Settings,
} from "@/contracts";
import { toLocalDate, useGoalPlan } from "@/features/gamification";
import { queryKeys } from "@/lib/query";
import { createQueryWrapper, createTestQueryClient } from "@/lib/query/testing";
import enDeCourse from "../../../../../content/courses/en-de/course.json";
import telcCourse from "../../../../../content/courses/telc-b1-en-de/course.json";
import { makeResult } from "../../rules/__tests__/fixtures";
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

type SettingsOverrides = Partial<Omit<Settings, "goalPlan">> & {
  /** The `en-de` plan, stored in the CTO-018 shape (`goalPlans`); `null` / `undefined` = none. */
  goalPlan?: GoalPlan | null;
};
const DEFAULT_PLAN = (): GoalPlan => ({ targetLevel: "A1", targetDate: inDays(100) });
const settings = (overrides: SettingsOverrides = {}): Settings => {
  const { goalPlan, ...rest } = overrides;
  const plan = "goalPlan" in overrides ? goalPlan : DEFAULT_PLAN();
  return {
    courseId: COURSE,
    dailyGoalXp: 20,
    soundEffectsEnabled: true,
    speakingExercisesEnabled: true,
    updatedAt: "2026-11-21T08:00:00.000Z",
    ...(plan ? { goalPlans: { [COURSE]: plan } } : {}),
    ...rest,
  };
};
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

describe("useGoalPlan per course (GAM-014, ADR-018)", () => {
  const TELC = "telc-b1-en-de";
  const TB1: Course = CourseSchema.parse(telcCourse);
  const telcA1 = TB1.units
    .filter((u) => u.level === "A1")
    .flatMap((u) => u.lessons.map((l) => l.id));
  const A2_PLAN: GoalPlan = { targetLevel: "A2", targetDate: "2027-03-12" };
  const telcDone = (lessonId: string): LessonResult => makeResult({ courseId: TELC, lessonId });

  function twoCourses(
    s: Settings,
    deResults: LessonResult[] = [],
    telcResults: LessonResult[] = [],
  ) {
    const client = seeded(s, deResults);
    client.setQueryData(queryKeys.progress(TELC), telcResults);
    client.setQueryData(queryKeys.content(TELC), TB1);
    return client;
  }

  function renderBoth(client: ReturnType<typeof createTestQueryClient>) {
    const wrapper = createQueryWrapper(client);
    const de = renderHook(() => useGoalPlan({ courseId: COURSE, timeZone: TZ }), { wrapper });
    const telc = renderHook(() => useGoalPlan({ courseId: TELC, timeZone: TZ }), { wrapper });
    return { de, telc };
  }

  it("AC2: a plan on en-de only gives en-de its status and telc null (worked example)", () => {
    const { de, telc } = renderBoth(twoCourses(settings({ goalPlan: A2_PLAN })));
    expect(de.result.current).toMatchObject({
      targetLevel: "A2",
      targetDate: "2027-03-12",
      lessonsLeft: 130,
    });
    expect(telc.result.current).toBeNull();
  });

  it("AC2: with plans on both courses each hook returns its own target and counts", () => {
    const s = settings({
      goalPlans: {
        [COURSE]: A2_PLAN,
        [TELC]: { targetLevel: "A1", targetDate: inDays(50) },
      },
    });
    const { de, telc } = renderBoth(twoCourses(s, [done(A1[0]!)], [telcDone(telcA1[0]!)]));
    expect(de.result.current).toMatchObject({
      targetLevel: "A2",
      targetDate: "2027-03-12",
      lessonsLeft: 129,
    });
    expect(telc.result.current).toMatchObject({
      targetLevel: "A1",
      targetDate: inDays(50),
      lessonsLeft: 49,
      daysLeft: 50,
      lessonsPerDay: 1,
    });
  });

  it("AC1: without courseId it uses the active course", () => {
    const s = settings({
      courseId: TELC,
      goalPlans: { [TELC]: { targetLevel: "A1", targetDate: inDays(50) } },
    });
    const client = twoCourses(s);
    const { result } = renderHook(() => useGoalPlan({ timeZone: TZ }), {
      wrapper: createQueryWrapper(client),
    });
    expect(result.current).toMatchObject({ targetLevel: "A1", lessonsLeft: 50 });
  });

  it("AC3: a migrated v0.5.4 record gives its single plan to the active course only", () => {
    const legacy: Settings = {
      courseId: COURSE,
      dailyGoalXp: 20,
      soundEffectsEnabled: true,
      speakingExercisesEnabled: true,
      updatedAt: "2026-11-21T08:00:00.000Z",
      goalPlan: A2_PLAN,
    };
    const { de, telc } = renderBoth(twoCourses(legacy));
    expect(de.result.current).toMatchObject({ targetLevel: "A2", lessonsLeft: 130 });
    expect(telc.result.current).toBeNull();

    const legacyOnTelc = renderBoth(twoCourses({ ...legacy, courseId: TELC }));
    expect(legacyOnTelc.de.result.current).toBeNull();
    expect(legacyOnTelc.telc.result.current).toMatchObject({ targetLevel: "A2", lessonsLeft: 107 });
  });

  it("AC3: a goalPlans entry wins over a legacy plan for the same course", () => {
    const s = settings({ goalPlan: A2_PLAN });
    const mixed: Settings = { ...s, goalPlan: { targetLevel: "A1", targetDate: inDays(5) } };
    const { de } = renderBoth(twoCourses(mixed));
    expect(de.result.current).toMatchObject({ targetLevel: "A2", targetDate: "2027-03-12" });
  });

  it("AC4: set, change, clear and a result of one course update only that course", async () => {
    const client = twoCourses(settings({ goalPlan: null }));
    const { de, telc } = renderBoth(client);
    expect(de.result.current).toBeNull();
    expect(telc.result.current).toBeNull();

    const telcPlan: GoalPlan = { targetLevel: "A1", targetDate: inDays(50) };
    act(() =>
      client.setQueryData(queryKeys.settings(), settings({ goalPlans: { [TELC]: telcPlan } })),
    );
    await waitFor(() => expect(telc.result.current).toMatchObject({ lessonsLeft: 50 }));
    expect(de.result.current).toBeNull();
    const telcBefore = telc.result.current;

    act(() =>
      client.setQueryData(
        queryKeys.settings(),
        settings({ goalPlans: { [TELC]: telcPlan, [COURSE]: A2_PLAN } }),
      ),
    );
    await waitFor(() => expect(de.result.current).toMatchObject({ lessonsLeft: 130 }));
    expect(telc.result.current).toEqual(telcBefore);

    act(() => client.setQueryData(queryKeys.progress(TELC), [telcDone(telcA1[0]!)]));
    await waitFor(() => expect(telc.result.current).toMatchObject({ lessonsLeft: 49 }));
    expect(de.result.current).toMatchObject({ lessonsLeft: 130 });

    act(() =>
      client.setQueryData(queryKeys.settings(), settings({ goalPlans: { [COURSE]: A2_PLAN } })),
    );
    await waitFor(() => expect(telc.result.current).toBeNull());
    expect(de.result.current).toMatchObject({ lessonsLeft: 130 });

    await act(() => client.invalidateQueries({ queryKey: queryKeys.progress(COURSE) }));
    expect(telc.result.current).toBeNull();
  });
});
