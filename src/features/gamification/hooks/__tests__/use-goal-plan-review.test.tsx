import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CourseSchema, type Course, type LessonResult, type Settings } from "@/contracts";
import { completedLessonIdsOf, toLocalDate, useGoalPlan } from "@/features/gamification";
import { queryKeys } from "@/lib/query";
import { createQueryWrapper, createTestQueryClient } from "@/lib/query/testing";
import enDeCourse from "../../../../../content/courses/en-de/course.json";
import { makeOutcomeResult, makeResult } from "../../rules/__tests__/fixtures";

vi.mock("@/lib/offline", () => ({ getLocalSession: async () => null }));

const COURSE = "en-de";
const TZ = "UTC";
const DE: Course = CourseSchema.parse(enDeCourse);
const A1 = DE.units.filter((u) => u.level === "A1").flatMap((u) => u.lessons.map((l) => l.id));
const today = () => toLocalDate(new Date(), TZ);
const inDays = (n: number) =>
  new Date(Date.parse(`${today()}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

// The legacy single plan of the active course: read the same before and after CTO-018.
const settings: Settings = {
  courseId: COURSE,
  dailyGoalXp: 20,
  soundEffectsEnabled: true,
  speakingExercisesEnabled: true,
  updatedAt: "2026-11-21T08:00:00.000Z",
  goalPlan: { targetLevel: "A1", targetDate: inDays(100) },
};

const review = (): LessonResult =>
  makeOutcomeResult({
    courseId: COURSE,
    lessonId: A1[0]!,
    kind: "review",
    date: today(),
    outcomes: [["ex-1", "correct"]],
  });
const done = (lessonId: string) => makeResult({ courseId: COURSE, lessonId });

function render(results: LessonResult[]) {
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.settings(), settings);
  client.setQueryData(queryKeys.progress(COURSE), results);
  client.setQueryData(queryKeys.content(COURSE), DE);
  return renderHook(() => useGoalPlan({ timeZone: TZ }), { wrapper: createQueryWrapper(client) })
    .result;
}

describe("useGoalPlan with review results (GAM-015 AC7)", () => {
  it("a review result is not a completed lesson", () => {
    expect(render([review()]).current).toMatchObject({ lessonsLeft: 60 });
    expect(render([review(), done(A1[0]!)]).current).toMatchObject({ lessonsLeft: 59 });
  });

  it("completedLessonIdsOf: each lesson once, first-result order, reviews skipped", () => {
    expect(completedLessonIdsOf([])).toEqual([]);
    expect(completedLessonIdsOf([done(A1[1]!), review(), done(A1[0]!), done(A1[1]!)])).toEqual([
      A1[1],
      A1[0],
    ]);
  });
});
