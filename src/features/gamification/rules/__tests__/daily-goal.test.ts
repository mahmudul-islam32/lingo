import { describe, expect, it } from "vitest";
import { DailyGoalProgressSchema, GAME_CONFIG, type DailyGoalXp } from "@/contracts";
import { computeDailyGoalProgress, dailyGoalFraction } from "../daily-goal";
import { makeResult } from "./fixtures";

const TODAY = "2026-11-07";
const perfect = (localDate = TODAY) => makeResult({ localDate }); // 15 XP
const withMistakes = (localDate = TODAY) => makeResult({ localDate, mistakeCount: 1 }); // 10 XP

function progress(...args: Parameters<typeof computeDailyGoalProgress>) {
  const value = computeDailyGoalProgress(...args);
  expect(() => DailyGoalProgressSchema.parse(value)).not.toThrow();
  return value;
}

describe("computeDailyGoalProgress", () => {
  it("no results -> 0 earned, not reached", () => {
    expect(progress([], 20, TODAY)).toEqual({
      localDate: TODAY,
      goalXp: 20,
      earnedXp: 0,
      reached: false,
    });
  });

  it("sums only results whose localDate is today", () => {
    const results = [perfect("2026-11-06"), perfect(), withMistakes(), perfect("2026-11-08")];
    expect(progress(results, 30, TODAY)).toMatchObject({ earnedXp: 25, reached: false });
  });

  it("reached exactly at the goal and above it", () => {
    expect(progress([withMistakes()], 10, TODAY)).toMatchObject({ earnedXp: 10, reached: true });
    expect(progress([perfect()], 10, TODAY)).toMatchObject({ earnedXp: 15, reached: true });
    expect(progress([perfect(), withMistakes()], 20, TODAY)).toMatchObject({
      earnedXp: 25,
      reached: true,
    });
  });

  it.each(GAME_CONFIG.dailyGoalOptions.map((goal) => [goal]))("works for goal %i", (goal) => {
    const lessons = Math.ceil(goal / GAME_CONFIG.xpPerLesson);
    const below = Array.from({ length: lessons - 1 }, () => withMistakes());
    const atGoal = Array.from({ length: lessons }, () => withMistakes());
    expect(progress(below, goal as DailyGoalXp, TODAY).reached).toBe(false);
    expect(progress(atGoal, goal as DailyGoalXp, TODAY).reached).toBe(true);
  });

  it("replays count toward the goal (PD-008)", () => {
    const replays = [makeResult({ lessonId: "lesson-1" }), makeResult({ lessonId: "lesson-1" })];
    expect(progress(replays, 30, TODAY)).toMatchObject({ earnedXp: 30, reached: true });
  });

  it("uses the stored device-local date, not the UTC instant", () => {
    // Completed at 23:30Z on Nov 7 = 00:30 on Nov 8 in Berlin.
    const late = makeResult({ completedAt: "2026-11-07T23:30:00.000Z", localDate: "2026-11-08" });
    expect(progress([late], 10, "2026-11-07").earnedXp).toBe(0);
    expect(progress([late], 10, "2026-11-08").earnedXp).toBe(15);
  });

  it("resets on a new local day", () => {
    const results = [perfect(), perfect()];
    expect(progress(results, 30, TODAY).reached).toBe(true);
    expect(progress(results, 30, "2026-11-08")).toEqual({
      localDate: "2026-11-08",
      goalXp: 30,
      earnedXp: 0,
      reached: false,
    });
  });
});

describe("dailyGoalFraction", () => {
  it.each([
    [0, 20, 0],
    [10, 20, 0.5],
    [20, 20, 1],
    [45, 20, 1],
  ])("%i / %i -> %d", (earnedXp, goalXp, expected) => {
    expect(dailyGoalFraction({ earnedXp, goalXp: goalXp as DailyGoalXp })).toBe(expected);
  });
});
