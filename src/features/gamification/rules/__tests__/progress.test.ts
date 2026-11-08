import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  GAME_CONFIG,
  UserProgressSchema,
  type DailyGoalXp,
  type HeartsState,
  type LessonResult,
} from "@/contracts";
import { computeUserProgress } from "@/features/gamification";
import { computeDailyGoalProgress } from "../daily-goal";
import { createFullHearts, refillHearts } from "../hearts";
import { computeStreak } from "../streak";
import { makeResult } from "./fixtures";

const COURSE = "es-en";
const TODAY = "2026-11-07";
const YESTERDAY = "2026-11-06";
const NOW = new Date("2026-11-07T12:00:00.000Z");
const HOUR = 60 * 60 * 1000;
const FULL = createFullHearts(new Date("2026-11-01T00:00:00.000Z"));

function run(
  results: readonly LessonResult[],
  overrides: Partial<{ hearts: HeartsState; goalXp: DailyGoalXp; today: string; now: Date }> = {},
) {
  const progress = computeUserProgress({
    courseId: COURSE,
    results,
    hearts: overrides.hearts ?? FULL,
    goalXp: overrides.goalXp ?? 20,
    today: overrides.today ?? TODAY,
    now: overrides.now ?? NOW,
  });
  // AC1: every output passes the contract schema.
  expect(UserProgressSchema.parse(progress)).toEqual(progress);
  return progress;
}

const perfect = (lessonId: string, localDate = TODAY) =>
  makeResult({ lessonId, localDate, perfect: true, mistakeCount: 0 });
const imperfect = (lessonId: string, localDate = TODAY) =>
  makeResult({ lessonId, localDate, perfect: false, mistakeCount: 1 });

describe("computeUserProgress (GAM-003)", () => {
  it("empty state: a new learner has 0 XP, no lessons, no streak, full hearts", () => {
    const progress = run([]);
    expect(progress).toEqual({
      courseId: COURSE,
      totalXp: 0,
      completedLessonIds: [],
      lessonsCompletedCount: 0,
      streak: { current: 0, longest: 0, lastActiveDate: null, extendedToday: false },
      hearts: FULL,
      dailyGoal: { localDate: TODAY, goalXp: 20, earnedXp: 0, reached: false },
    });
  });

  // AC12 table.
  it.each<{
    name: string;
    results: () => LessonResult[];
    totalXp: number;
    todayXp: number;
    completed: string[];
  }>([
    {
      name: "one perfect lesson: 15 total, 15 today",
      results: () => [perfect("lesson-1")],
      totalXp: GAME_CONFIG.xpPerLesson + GAME_CONFIG.perfectLessonBonusXp,
      todayXp: GAME_CONFIG.xpPerLesson + GAME_CONFIG.perfectLessonBonusXp,
      completed: ["lesson-1"],
    },
    {
      name: "a replay of the same lesson: 30 total, still 1 lesson completed",
      results: () => [perfect("lesson-1"), perfect("lesson-1")],
      totalXp: 30,
      todayXp: 30,
      completed: ["lesson-1"],
    },
    {
      name: "results from yesterday and today: only today's XP in dailyGoal",
      results: () => [perfect("lesson-1", YESTERDAY), imperfect("lesson-2", TODAY)],
      totalXp: 25,
      todayXp: 10,
      completed: ["lesson-1", "lesson-2"],
    },
    {
      name: "an imperfect lesson earns base XP only",
      results: () => [imperfect("lesson-1")],
      totalXp: 10,
      todayXp: 10,
      completed: ["lesson-1"],
    },
    {
      name: "results of another course are ignored",
      results: () => [
        perfect("lesson-1"),
        makeResult({ courseId: "fr-en", lessonId: "lesson-9" }),
        makeResult({ courseId: "fr-en", lessonId: "lesson-1", localDate: YESTERDAY }),
      ],
      totalXp: 15,
      todayXp: 15,
      completed: ["lesson-1"],
    },
    {
      name: "only results of another course: everything is empty",
      results: () => [makeResult({ courseId: "fr-en" })],
      totalXp: 0,
      todayXp: 0,
      completed: [],
    },
    {
      name: "a result dated in the future (west-bound travel) adds XP but not today's XP",
      results: () => [perfect("lesson-1", "2026-11-08")],
      totalXp: 15,
      todayXp: 0,
      completed: ["lesson-1"],
    },
  ])("$name", ({ results, totalXp, todayXp, completed }) => {
    const progress = run(results());
    expect(progress.totalXp).toBe(totalXp);
    expect(progress.dailyGoal.earnedXp).toBe(todayXp);
    expect(progress.completedLessonIds).toEqual(completed);
    expect(progress.lessonsCompletedCount).toBe(completed.length);
  });

  it("lists completed lessons once each, in the order of their first result", () => {
    const progress = run([
      perfect("lesson-3"),
      perfect("lesson-1"),
      perfect("lesson-3"),
      perfect("lesson-2"),
      perfect("lesson-1"),
    ]);
    expect(progress.completedLessonIds).toEqual(["lesson-3", "lesson-1", "lesson-2"]);
    expect(progress.lessonsCompletedCount).toBe(3);
  });

  it("dailyGoal equals computeDailyGoalProgress over the course results (AC4)", () => {
    const results = [perfect("lesson-1"), perfect("lesson-2"), perfect("lesson-3", YESTERDAY)];
    for (const goalXp of GAME_CONFIG.dailyGoalOptions) {
      const progress = run(results, { goalXp });
      expect(progress.dailyGoal).toEqual(computeDailyGoalProgress(results, goalXp, TODAY));
    }
    expect(run(results, { goalXp: 30 }).dailyGoal.reached).toBe(true);
    expect(run(results, { goalXp: 50 }).dailyGoal.reached).toBe(false);
  });

  it("daily goal ignores today's XP from another course", () => {
    const progress = run([makeResult({ courseId: "fr-en", localDate: TODAY })], { goalXp: 10 });
    expect(progress.dailyGoal).toEqual({
      localDate: TODAY,
      goalXp: 10,
      earnedXp: 0,
      reached: false,
    });
  });

  describe("streak (AC5)", () => {
    it("comes from computeStreak over the distinct local dates", () => {
      const results = [
        perfect("lesson-1", "2026-11-05"),
        perfect("lesson-2", YESTERDAY),
        perfect("lesson-2", YESTERDAY),
        perfect("lesson-3", TODAY),
      ];
      const progress = run(results);
      expect(progress.streak).toEqual(computeStreak(["2026-11-05", YESTERDAY, TODAY], TODAY));
      expect(progress.streak).toEqual({
        current: 3,
        longest: 3,
        lastActiveDate: TODAY,
        extendedToday: true,
      });
    });

    it("is still alive when the last lesson was yesterday", () => {
      expect(run([perfect("lesson-1", YESTERDAY)]).streak).toEqual({
        current: 1,
        longest: 1,
        lastActiveDate: YESTERDAY,
        extendedToday: false,
      });
    });

    it("resets after a missed day", () => {
      expect(run([perfect("lesson-1", "2026-11-05")]).streak.current).toBe(0);
    });

    it("uses `today` from the input, not the result instants (timezone-safe)", () => {
      // Completed at 23:30 UTC on the 6th, but the device was in Tokyo: local date is the 7th.
      const result = makeResult({
        startedAt: "2026-11-06T23:20:00.000Z",
        completedAt: "2026-11-06T23:30:00.000Z",
        localDate: TODAY,
        timeZone: "Asia/Tokyo",
      });
      const progress = run([result]);
      expect(progress.streak.extendedToday).toBe(true);
      expect(progress.dailyGoal.earnedXp).toBe(result.xpEarned);
    });

    it("ignores streak dates of other courses", () => {
      const progress = run([
        makeResult({ courseId: "fr-en", localDate: YESTERDAY }),
        perfect("lesson-1", TODAY),
      ]);
      expect(progress.streak.current).toBe(1);
    });
  });

  describe("hearts (AC5)", () => {
    it("full hearts pass through unchanged", () => {
      expect(run([]).hearts).toBe(FULL);
    });

    it.each<{ name: string; state: HeartsState; current: number; refillStartedAt: string | null }>([
      {
        name: "no refill yet (under one interval)",
        state: {
          current: 2,
          refillStartedAt: new Date(NOW.getTime() - 3 * HOUR).toISOString(),
          updatedAt: "2026-11-07T09:00:00.000Z",
        },
        current: 2,
        refillStartedAt: new Date(NOW.getTime() - 3 * HOUR).toISOString(),
      },
      {
        name: "one heart refilled lazily at now, clock advanced",
        state: {
          current: 2,
          refillStartedAt: new Date(NOW.getTime() - 5 * HOUR).toISOString(),
          updatedAt: "2026-11-07T07:00:00.000Z",
        },
        current: 3,
        refillStartedAt: new Date(NOW.getTime() - HOUR).toISOString(),
      },
      {
        name: "0 hearts refilled to full after long enough",
        state: {
          current: 0,
          refillStartedAt: "2026-11-05T00:00:00.000Z",
          updatedAt: "2026-11-05T00:00:00.000Z",
        },
        current: GAME_CONFIG.maxHearts,
        refillStartedAt: null,
      },
    ])("$name", ({ state, current, refillStartedAt }) => {
      const progress = run([], { hearts: state });
      expect(progress.hearts).toEqual(refillHearts(state, NOW));
      expect(progress.hearts.current).toBe(current);
      expect(progress.hearts.refillStartedAt).toBe(refillStartedAt);
      expect(progress.hearts.updatedAt).toBe(state.updatedAt);
    });
  });

  it("does not mutate its inputs", () => {
    const results = Object.freeze([perfect("lesson-1"), perfect("lesson-2")]);
    const hearts = Object.freeze({ ...FULL });
    expect(() => run(results, { hearts })).not.toThrow();
  });

  it("computes 1,000 results in under 50 ms (AC12)", () => {
    const results = Array.from({ length: 1000 }, (_, i) =>
      perfect(`lesson-${(i % 5) + 1}`, `2026-${String((i % 10) + 1).padStart(2, "0")}-15`),
    );
    run(results); // warm-up
    const start = performance.now();
    const progress = computeUserProgress({
      courseId: COURSE,
      results,
      hearts: FULL,
      goalXp: 20,
      today: TODAY,
      now: NOW,
    });
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
    expect(progress.totalXp).toBe(15_000);
    expect(progress.lessonsCompletedCount).toBe(5);
  });

  it("contains no XP, heart or goal number literals (AC7)", () => {
    const path = join(process.cwd(), "src/features/gamification/rules/progress.ts");
    const code = readFileSync(path, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
    // Only the sum seed `0` is allowed; every game value comes from inputs or GAME_CONFIG.
    expect(code).not.toMatch(/\b(?:[1-9]\d*|0\d+|\d+\.\d+)\b/);
  });
});
