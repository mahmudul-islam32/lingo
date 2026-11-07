import { describe, expect, it } from "vitest";
import {
  DailyGoalProgressSchema,
  HeartsStateSchema,
  StreakStateSchema,
  UserProgressSchema,
  XpEventSchema,
} from "../index";
import { heartsFull, heartsRefilling, UUID_A, UUID_B } from "./fixtures";

describe("HeartsStateSchema", () => {
  it("accepts full hearts without a refill clock and partial hearts with one", () => {
    expect(HeartsStateSchema.safeParse(heartsFull).success).toBe(true);
    expect(HeartsStateSchema.safeParse(heartsRefilling).success).toBe(true);
    expect(HeartsStateSchema.safeParse({ ...heartsRefilling, current: 0 }).success).toBe(true);
  });

  it("rejects inconsistent refill clocks", () => {
    const fullWithClock = { ...heartsFull, refillStartedAt: "2026-11-07T09:00:00.000Z" };
    const partialWithoutClock = { ...heartsRefilling, refillStartedAt: null };
    expect(HeartsStateSchema.safeParse(fullWithClock).success).toBe(false);
    expect(HeartsStateSchema.safeParse(partialWithoutClock).success).toBe(false);
  });

  it("rejects counts outside 0..5", () => {
    expect(HeartsStateSchema.safeParse({ ...heartsRefilling, current: -1 }).success).toBe(false);
    expect(HeartsStateSchema.safeParse({ ...heartsFull, current: 6 }).success).toBe(false);
  });
});

describe("StreakStateSchema", () => {
  it("accepts an empty and an active streak", () => {
    const empty = { current: 0, longest: 0, lastActiveDate: null, extendedToday: false };
    const active = { current: 3, longest: 7, lastActiveDate: "2026-11-07", extendedToday: true };
    expect(StreakStateSchema.safeParse(empty).success).toBe(true);
    expect(StreakStateSchema.safeParse(active).success).toBe(true);
  });

  it.each([
    [
      "longest < current",
      { current: 4, longest: 3, lastActiveDate: "2026-11-07", extendedToday: false },
    ],
    [
      "history without a date",
      { current: 0, longest: 2, lastActiveDate: null, extendedToday: false },
    ],
    [
      "extended today with 0",
      { current: 0, longest: 2, lastActiveDate: "2026-11-07", extendedToday: true },
    ],
  ])("rejects %s", (_name, streak) => {
    expect(StreakStateSchema.safeParse(streak).success).toBe(false);
  });
});

describe("DailyGoalProgressSchema", () => {
  it("accepts consistent progress", () => {
    const progress = { localDate: "2026-11-07", goalXp: 20, earnedXp: 25, reached: true };
    expect(DailyGoalProgressSchema.safeParse(progress).success).toBe(true);
  });

  it("rejects a reached flag that disagrees with the numbers, and a bad goal", () => {
    const wrong = { localDate: "2026-11-07", goalXp: 20, earnedXp: 10, reached: true };
    expect(DailyGoalProgressSchema.safeParse(wrong).success).toBe(false);
    expect(
      DailyGoalProgressSchema.safeParse({ ...wrong, goalXp: 25, reached: false }).success,
    ).toBe(false);
  });
});

describe("XpEventSchema", () => {
  const event = {
    id: UUID_A,
    lessonResultId: UUID_B,
    reason: "perfect_lesson_bonus",
    amount: 5,
    occurredAt: "2026-11-07T10:04:30.000Z",
    localDate: "2026-11-07",
  };

  it("accepts a valid event", () => {
    expect(XpEventSchema.safeParse(event).success).toBe(true);
  });

  it("rejects zero amounts and unknown reasons", () => {
    expect(XpEventSchema.safeParse({ ...event, amount: 0 }).success).toBe(false);
    expect(XpEventSchema.safeParse({ ...event, reason: "daily_login" }).success).toBe(false);
  });
});

describe("UserProgressSchema", () => {
  it("accepts a fresh learner", () => {
    const progress = {
      courseId: "spanish-from-english",
      totalXp: 0,
      completedLessonIds: [],
      lessonsCompletedCount: 0,
      streak: { current: 0, longest: 0, lastActiveDate: null, extendedToday: false },
      hearts: heartsFull,
      dailyGoal: { localDate: "2026-11-07", goalXp: 10, earnedXp: 0, reached: false },
    };
    expect(UserProgressSchema.safeParse(progress).success).toBe(true);
  });
});
