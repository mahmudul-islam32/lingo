import { describe, expect, it } from "vitest";
import { LessonResultSchema, LessonSessionSchema } from "../index";
import { lessonResult, UUID_A } from "./fixtures";

describe("LessonResultSchema", () => {
  it("accepts a valid result", () => {
    expect(LessonResultSchema.parse(lessonResult)).toEqual(lessonResult);
  });

  it("accepts a perfect result with the bonus", () => {
    const perfect = {
      ...lessonResult,
      mistakeCount: 0,
      heartsLost: 0,
      perfect: true,
      xp: { base: 10, perfectBonus: 5 },
      xpEarned: 15,
    };
    expect(LessonResultSchema.safeParse(perfect).success).toBe(true);
  });

  it.each([
    ["completedAt before startedAt", { completedAt: "2026-11-07T09:59:00.000Z" }],
    ["perfect with mistakes", { perfect: true }],
    ["bonus without perfect", { xp: { base: 10, perfectBonus: 5 }, xpEarned: 15 }],
    ["xpEarned mismatch", { xpEarned: 12 }],
    ["more hearts lost than mistakes", { heartsLost: 2 }],
    ["too many first-try corrects", { firstTryCorrectCount: 5 }],
    ["accuracy above 1", { accuracy: 1.2 }],
    ["non-UTC timestamp", { startedAt: "2026-11-07T10:00:00+01:00" }],
    ["bad local date", { localDate: "07/11/2026" }],
    ["non-uuid id", { id: "result-1" }],
  ])("rejects %s", (_name, patch) => {
    expect(LessonResultSchema.safeParse({ ...lessonResult, ...patch }).success).toBe(false);
  });
});

describe("LessonSessionSchema", () => {
  const session = {
    sessionId: UUID_A,
    courseId: "spanish-from-english",
    unitId: "unit-1",
    lessonId: "greetings-1",
    status: "in_progress",
    startedAt: "2026-11-07T10:00:00.000Z",
    queue: ["ex-2", "ex-3", "ex-1"],
    hiddenExerciseIds: ["ex-5"],
    attempts: [
      {
        exerciseId: "ex-1",
        exerciseType: "multiple_choice",
        answer: { type: "multiple_choice", optionId: "b" },
        outcome: "incorrect",
        heartCost: 1,
        isRetry: false,
        answeredAt: "2026-11-07T10:00:20.000Z",
      },
    ],
    heartsAtStart: 5,
    heartsRemaining: 4,
  };

  it("accepts a valid in-progress session", () => {
    expect(LessonSessionSchema.safeParse(session).success).toBe(true);
  });

  it("rejects an unknown status", () => {
    expect(LessonSessionSchema.safeParse({ ...session, status: "paused" }).success).toBe(false);
  });
});
