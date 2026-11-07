import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GAME_CONFIG, LessonResultSchema, XpEventSchema } from "@/contracts";
import {
  calculateXp,
  computeLessonXp,
  deriveXpEvents,
  isPerfectLesson,
  totalXp,
  type LessonXpSummary,
} from "../xp";
import { makeResult, sequentialIds } from "./fixtures";

const summary = (overrides: Partial<LessonXpSummary> = {}): LessonXpSummary => ({
  status: "completed",
  mistakeCount: 0,
  countedExerciseCount: 10,
  ...overrides,
});

describe("calculateXp (GAM-002)", () => {
  it("perfect lesson earns base + bonus = 15 (AC2, AC3)", () => {
    expect(calculateXp(summary())).toEqual({ base: 10, perfectBonus: 5, total: 15 });
  });

  it("lesson with mistakes earns base only = 10 (AC2)", () => {
    expect(calculateXp(summary({ mistakeCount: 1 }))).toEqual({
      base: 10,
      perfectBonus: 0,
      total: 10,
    });
    expect(calculateXp(summary({ mistakeCount: 7 }))).toEqual({
      base: 10,
      perfectBonus: 0,
      total: 10,
    });
  });

  it.each(["quit", "out_of_hearts", "in_progress"] as const)(
    "a %s lesson earns 0 in every field (AC4)",
    (status) => {
      expect(calculateXp(summary({ status }))).toEqual({ base: 0, perfectBonus: 0, total: 0 });
      expect(calculateXp(summary({ status, mistakeCount: 3 }))).toEqual({
        base: 0,
        perfectBonus: 0,
        total: 0,
      });
    },
  );

  it("skipped exercises are not mistakes and keep the perfect bonus (AC5)", () => {
    // 10 exercises, 2 speak skipped: 8 counted, all correct, 0 mistakes.
    expect(calculateXp(summary({ countedExerciseCount: 8, mistakeCount: 0 }))).toEqual({
      base: 10,
      perfectBonus: 5,
      total: 15,
    });
  });

  it("no counted exercise means no perfect bonus (PD-012), base still earned", () => {
    expect(calculateXp(summary({ countedExerciseCount: 0 }))).toEqual({
      base: 10,
      perfectBonus: 0,
      total: 10,
    });
  });

  it("a replay earns the same XP as the first play (AC6, PD-008)", () => {
    const first = calculateXp(summary());
    const replay = calculateXp(summary());
    expect(replay).toEqual(first);
    expect(calculateXp(summary({ mistakeCount: 2 }))).toEqual(
      calculateXp(summary({ mistakeCount: 2 })),
    );
  });

  it("reads every value from the config argument: 12 / 3 (AC7)", () => {
    const config = { xpPerLesson: 12, perfectLessonBonusXp: 3 };
    expect(calculateXp(summary(), config)).toEqual({ base: 12, perfectBonus: 3, total: 15 });
    expect(calculateXp(summary({ mistakeCount: 1 }), config)).toEqual({
      base: 12,
      perfectBonus: 0,
      total: 12,
    });
    expect(calculateXp(summary({ status: "quit" }), config)).toEqual({
      base: 0,
      perfectBonus: 0,
      total: 0,
    });
  });

  it("supports a zero perfect bonus", () => {
    expect(calculateXp(summary(), { xpPerLesson: 7, perfectLessonBonusXp: 0 })).toEqual({
      base: 7,
      perfectBonus: 0,
      total: 7,
    });
  });

  it("defaults to GAME_CONFIG", () => {
    expect(calculateXp(summary()).total).toBe(
      GAME_CONFIG.xpPerLesson + GAME_CONFIG.perfectLessonBonusXp,
    );
  });

  it("does not mutate its input", () => {
    const input = Object.freeze(summary());
    expect(() => calculateXp(input)).not.toThrow();
  });
});

describe("computeLessonXp (contract ComputeLessonXp)", () => {
  it("returns the contract breakdown", () => {
    expect(computeLessonXp({ perfect: true })).toEqual({ base: 10, perfectBonus: 5 });
    expect(computeLessonXp({ perfect: false })).toEqual({ base: 10, perfectBonus: 0 });
  });

  it("uses a custom config", () => {
    expect(
      computeLessonXp({ perfect: true }, { xpPerLesson: 12, perfectLessonBonusXp: 3 }),
    ).toEqual({
      base: 12,
      perfectBonus: 3,
    });
  });

  it("produces a breakdown that a LessonResult accepts", () => {
    for (const perfect of [true, false]) {
      const xp = computeLessonXp({ perfect });
      expect(() =>
        LessonResultSchema.parse(
          makeResult({
            perfect,
            mistakeCount: perfect ? 0 : 2,
            heartsLost: 0,
            xp,
            xpEarned: totalXp(xp),
          }),
        ),
      ).not.toThrow();
    }
  });
});

describe("isPerfectLesson / totalXp", () => {
  it.each([
    [0, 1, true],
    [0, 10, true],
    [0, 0, false],
    [1, 10, false],
  ])("mistakes=%i counted=%i -> %s", (mistakeCount, countedExerciseCount, expected) => {
    expect(isPerfectLesson({ mistakeCount, countedExerciseCount })).toBe(expected);
  });

  it("sums the breakdown", () => {
    expect(totalXp({ base: 10, perfectBonus: 5 })).toBe(15);
    expect(totalXp({ base: 0, perfectBonus: 0 })).toBe(0);
  });
});

describe("deriveXpEvents (contract DeriveXpEvents)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2031-01-01T00:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("perfect result -> base and bonus events, in that order", () => {
    const result = makeResult({
      completedAt: "2026-11-07T23:30:00.000Z",
      localDate: "2026-11-08",
      timeZone: "Asia/Tokyo",
    });
    const events = deriveXpEvents(result, sequentialIds());
    expect(events).toEqual([
      {
        id: "00000000-0000-4000-8000-000000000001",
        lessonResultId: result.id,
        reason: "lesson_completed",
        amount: 10,
        occurredAt: "2026-11-07T23:30:00.000Z",
        localDate: "2026-11-08",
      },
      {
        id: "00000000-0000-4000-8000-000000000002",
        lessonResultId: result.id,
        reason: "perfect_lesson_bonus",
        amount: 5,
        occurredAt: "2026-11-07T23:30:00.000Z",
        localDate: "2026-11-08",
      },
    ]);
    for (const event of events) expect(() => XpEventSchema.parse(event)).not.toThrow();
  });

  it("result with mistakes -> only the base event (zero lines are dropped)", () => {
    const events = deriveXpEvents(makeResult({ mistakeCount: 2 }), sequentialIds());
    expect(events.map((e) => [e.reason, e.amount])).toEqual([["lesson_completed", 10]]);
  });

  it("perfect result with a zero bonus config -> only the base event", () => {
    const result = makeResult({ xp: { base: 10, perfectBonus: 0 }, xpEarned: 10 });
    expect(deriveXpEvents(result, sequentialIds()).map((e) => e.reason)).toEqual([
      "lesson_completed",
    ]);
  });

  it("calls newId once per event and uses event time from the result, not the clock", () => {
    const newId = vi.fn(sequentialIds());
    const events = deriveXpEvents(makeResult(), newId);
    expect(newId).toHaveBeenCalledTimes(2);
    expect(events.every((e) => e.occurredAt === "2026-11-07T10:05:00.000Z")).toBe(true);
  });
});
