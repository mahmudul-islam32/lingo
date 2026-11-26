import { describe, expect, it } from "vitest";
import {
  CONTRACTS_VERSION,
  CourseSchema,
  EXERCISE_TYPES,
  GAME_CONFIG,
  GameConfigSchema,
  GuestMigrationPayloadSchema,
  LessonResultSchema,
  REVIEW_EXERCISE_TYPES,
  REVIEW_SESSION_ID,
  ReviewItemSchema,
  ReviewSelectionSchema,
  SyncQueueRecordSchema,
  isReviewExerciseType,
  isReviewResult,
  lessonResultKind,
  type ExerciseOutcome,
  type LessonResult,
} from "../index";
import {
  UUID_A,
  UUID_B,
  course,
  heartsFull,
  lessonResult,
  listen,
  matchPairs,
  multipleChoice,
  profile,
  settings,
  speak,
  wordBank,
} from "./fixtures";

/** CTO-019 (ADR-019, PD-079 – PD-081). Criteria numbers refer to the ticket. */

/**
 * The fixture result (5 exercises: 3 first-try correct, 1 skipped, 1 with a mistake) with
 * matching outcomes, in presentation order.
 */
const outcomes: ExerciseOutcome[] = [
  {
    lessonId: "greetings-1",
    exerciseId: "ex-1",
    exerciseType: "multiple_choice",
    outcome: "correct",
  },
  {
    lessonId: "greetings-1",
    exerciseId: "ex-2",
    exerciseType: "word_bank_translate",
    outcome: "correct",
  },
  {
    lessonId: "greetings-1",
    exerciseId: "ex-3",
    exerciseType: "match_pairs",
    outcome: "incorrect",
  },
  { lessonId: "greetings-1", exerciseId: "ex-4", exerciseType: "listen", outcome: "correct" },
  { lessonId: "greetings-1", exerciseId: "ex-5", exerciseType: "speak", outcome: "skipped" },
];
const withOutcomes: LessonResult = { ...lessonResult, exerciseOutcomes: outcomes };

/** A review of 3 exercises from two lessons: 1 first-try correct, 2 with a mistake. */
const review: LessonResult = {
  ...lessonResult,
  id: UUID_B,
  kind: "review",
  unitId: REVIEW_SESSION_ID,
  lessonId: REVIEW_SESSION_ID,
  exerciseCount: 3,
  firstTryCorrectCount: 1,
  mistakeCount: 2,
  skippedCount: 0,
  accuracy: 1 / 3,
  heartsLost: 0,
  exerciseOutcomes: [
    {
      lessonId: "greetings-1",
      exerciseId: "ex-1",
      exerciseType: "multiple_choice",
      outcome: "correct",
    },
    {
      lessonId: "introductions-1",
      exerciseId: "ex-7",
      exerciseType: "cloze",
      outcome: "incorrect",
    },
    {
      lessonId: "greetings-1",
      exerciseId: "ex-3",
      exerciseType: "match_pairs",
      outcome: "incorrect",
    },
  ],
};

const issues = (value: unknown) =>
  (LessonResultSchema.safeParse(value).error?.issues ?? []).map((i) => i.message);

describe("LessonResult.exerciseOutcomes (criteria 1, 2, 5)", () => {
  it("accepts a lesson result with one outcome per presented exercise", () => {
    expect(LessonResultSchema.parse(withOutcomes)).toEqual(withOutcomes);
  });

  it("accepts a review result whose outcomes point to their source lessons", () => {
    expect(LessonResultSchema.parse(review)).toEqual(review);
  });

  it("accepts fewer outcomes than exercises (at most exerciseCount)", () => {
    const fewer = {
      ...withOutcomes,
      exerciseOutcomes: outcomes.filter((o) => o.exerciseId !== "ex-3"),
    };
    expect(LessonResultSchema.safeParse(fewer).success).toBe(true);
  });

  it("rejects more outcomes than exerciseCount", () => {
    expect(issues({ ...withOutcomes, exerciseCount: 4, firstTryCorrectCount: 3 })).toContain(
      "more exercise outcomes than exerciseCount",
    );
  });

  it("rejects two outcomes for the same (lessonId, exerciseId)", () => {
    const dup = { ...outcomes[2]!, outcome: "incorrect" as const };
    expect(issues({ ...withOutcomes, exerciseOutcomes: [...outcomes.slice(0, 4), dup] })).toEqual(
      expect.arrayContaining(["at most one outcome per (lessonId, exerciseId)"]),
    );
  });

  it("allows the same exerciseId in two different lessons of a review", () => {
    const sameId = review.exerciseOutcomes!.map((o, i) =>
      i === 1 ? { ...o, exerciseId: "ex-1" } : o,
    );
    expect(LessonResultSchema.safeParse({ ...review, exerciseOutcomes: sameId }).success).toBe(
      true,
    );
  });

  it("rejects correct outcomes that differ from firstTryCorrectCount", () => {
    expect(issues({ ...withOutcomes, firstTryCorrectCount: 2 })).toContain(
      "correct outcomes must equal firstTryCorrectCount",
    );
  });

  it("rejects skipped outcomes that differ from skippedCount", () => {
    const noSkip = outcomes.map((o) =>
      o.outcome === "skipped" ? { ...o, outcome: "incorrect" as const } : o,
    );
    expect(issues({ ...withOutcomes, exerciseOutcomes: noSkip })).toContain(
      "skipped outcomes must equal skippedCount",
    );
  });

  it("rejects a lesson result outcome from another lesson", () => {
    const other = outcomes.map((o, i) => (i === 0 ? { ...o, lessonId: "introductions-1" } : o));
    expect(issues({ ...withOutcomes, exerciseOutcomes: other })).toContain(
      "a lesson result's outcomes belong to its lesson",
    );
  });

  it("rejects a review outcome that points to the review itself (criterion 2)", () => {
    const self = review.exerciseOutcomes!.map((o, i) =>
      i === 0 ? { ...o, lessonId: REVIEW_SESSION_ID } : o,
    );
    expect(issues({ ...review, exerciseOutcomes: self })).toContain(
      "a review outcome points to its source lesson",
    );
  });

  it.each([
    ["an unknown outcome", { outcome: "partial" }],
    ["an unknown exercise type", { exerciseType: "essay" }],
    ["a non-slug exercise id", { exerciseId: "Ex 1" }],
    ["an extra key (e.g. a timestamp)", { answeredAt: "2026-11-07T10:00:00.000Z" }],
  ])("rejects an outcome with %s", (_, patch) => {
    const bad = outcomes.map((o, i) => (i === 0 ? { ...o, ...patch } : o));
    expect(LessonResultSchema.safeParse({ ...withOutcomes, exerciseOutcomes: bad }).success).toBe(
      false,
    );
  });
});

describe("compatibility (criterion 6)", () => {
  it("a result stored by v0.5.4 (no kind, no outcomes) still parses as a lesson", () => {
    const stored = LessonResultSchema.parse(lessonResult);
    expect(stored).not.toHaveProperty("kind");
    expect(stored).not.toHaveProperty("exerciseOutcomes");
    expect(lessonResultKind(stored)).toBe("lesson");
    expect(isReviewResult(stored)).toBe(false);
  });

  it("CONTRACTS_VERSION stays 1 and queued v0.5.4 lesson_result records still parse", () => {
    expect(CONTRACTS_VERSION).toBe(1);
    const record = {
      id: UUID_A,
      schemaVersion: 1,
      kind: "lesson_result",
      status: "pending",
      createdAt: "2026-11-25T10:00:00.000Z",
      attemptCount: 0,
      nextAttemptAt: "2026-11-25T10:00:00.000Z",
      lastError: null,
    };
    expect(SyncQueueRecordSchema.safeParse({ ...record, payload: lessonResult }).success).toBe(
      true,
    );
    expect(SyncQueueRecordSchema.safeParse({ ...record, payload: review }).success).toBe(true);
  });

  it("the guest migration payload carries outcomes and the review kind", () => {
    const payload = GuestMigrationPayloadSchema.parse({
      schemaVersion: 1,
      guestId: UUID_A,
      profile,
      settings,
      hearts: heartsFull,
      lessonResults: [lessonResult, withOutcomes, review].map((r, i) => ({
        ...r,
        id: [UUID_A, "6b1d0c2e-3f4a-4b5c-8d6e-7f8091a2b3c4", UUID_B][i]!,
      })),
    });
    expect(payload.lessonResults[1]!.exerciseOutcomes).toEqual(outcomes);
    expect(payload.lessonResults[2]!.kind).toBe("review");
  });
});

describe("review results (criteria 7, 8)", () => {
  it("reads a missing kind as lesson and flags review results", () => {
    expect(lessonResultKind({})).toBe("lesson");
    expect(lessonResultKind({ kind: "lesson" })).toBe("lesson");
    expect(isReviewResult(review)).toBe(true);
  });

  it.each(["unitId", "lessonId"] as const)("a review result must have %s = review", (key) => {
    expect(issues({ ...review, [key]: "unit-1" })).toContain(`a review result has ${key} "review"`);
  });

  it.each([
    ["a missing kind", {}],
    ["kind lesson", { kind: "lesson" }],
  ])("the reserved id is rejected on a result with %s", (_, kind) => {
    const bad = { ...lessonResult, ...kind, lessonId: REVIEW_SESSION_ID };
    expect(issues(bad)).toContain('"review" is reserved for review results');
  });

  it("a review result needs at least one outcome", () => {
    const noOutcomes = { ...review, exerciseOutcomes: undefined };
    expect(issues(noOutcomes)).toContain("a review result has at least one exercise outcome");
    expect(issues({ ...review, exerciseOutcomes: [] })).toContain(
      "a review result has at least one exercise outcome",
    );
  });

  it("rejects an unknown kind", () => {
    expect(LessonResultSchema.safeParse({ ...review, kind: "exam" }).success).toBe(false);
  });

  it("no course may use the reserved id for a unit or a lesson", () => {
    expect(CourseSchema.safeParse(course).success).toBe(true);
    const lessonNamedReview = {
      ...course,
      units: [{ ...course.units[0]!, lessons: [{ id: REVIEW_SESSION_ID, title: "Review" }] }],
    };
    const unitNamedReview = { ...course, units: [{ ...course.units[0]!, id: REVIEW_SESSION_ID }] };
    for (const bad of [lessonNamedReview, unitNamedReview]) {
      const messages = CourseSchema.safeParse(bad).error?.issues.map((i) => i.message);
      expect(messages).toContain('"review" is reserved for review sessions (ADR-019)');
    }
  });
});

describe("ReviewItem and ReviewSelection (criterion 9)", () => {
  const item = {
    courseId: course.id,
    unitId: "unit-1",
    lessonId: "greetings-1",
    exercise: multipleChoice,
  };

  it("accepts an item for every reviewable exercise type", () => {
    for (const exercise of [multipleChoice, wordBank, matchPairs, listen]) {
      expect(ReviewItemSchema.safeParse({ ...item, exercise }).success).toBe(true);
    }
  });

  it("rejects an item whose exercise type can't be reviewed", () => {
    expect(ReviewItemSchema.safeParse({ ...item, exercise: speak }).success).toBe(false);
  });

  it("accepts a ranked selection and checks its counts", () => {
    const candidates = [
      { lessonId: "greetings-1", exerciseId: "ex-3" },
      { lessonId: "greetings-1", exerciseId: "ex-1" },
    ];
    expect(
      ReviewSelectionSchema.safeParse({ candidates, dueCount: 1, eligibleCount: 2 }).success,
    ).toBe(true);
    expect(
      ReviewSelectionSchema.safeParse({ candidates: [], dueCount: 0, eligibleCount: 0 }).success,
    ).toBe(true);
    expect(
      ReviewSelectionSchema.safeParse({ candidates, dueCount: 3, eligibleCount: 2 }).success,
    ).toBe(false);
    expect(
      ReviewSelectionSchema.safeParse({ candidates, dueCount: 1, eligibleCount: 1 }).success,
    ).toBe(false);
    const sameId = [candidates[0]!, { lessonId: "introductions-1", exerciseId: "ex-3" }];
    expect(
      ReviewSelectionSchema.safeParse({ candidates: sameId, dueCount: 0, eligibleCount: 2 })
        .success,
    ).toBe(false);
  });
});

describe("config (criteria 10, 11)", () => {
  it("has the review session size and intervals", () => {
    expect(GAME_CONFIG.reviewSessionSize).toBe(10);
    expect(GAME_CONFIG.reviewIntervalsDays).toEqual([1, 3, 7, 14, 30]);
    expect(GameConfigSchema.safeParse(GAME_CONFIG).success).toBe(true);
  });

  it.each([
    ["a zero session size", { reviewSessionSize: 0 }],
    ["a fractional session size", { reviewSessionSize: 2.5 }],
    ["no intervals", { reviewIntervalsDays: [] }],
    ["a zero interval", { reviewIntervalsDays: [0, 3] }],
    ["equal intervals", { reviewIntervalsDays: [1, 3, 3] }],
    ["decreasing intervals", { reviewIntervalsDays: [1, 7, 3] }],
    ["a fractional interval", { reviewIntervalsDays: [1, 2.5] }],
  ])("rejects %s", (_, patch) => {
    expect(GameConfigSchema.safeParse({ ...GAME_CONFIG, ...patch }).success).toBe(false);
  });

  it("REVIEW_EXERCISE_TYPES are every type except speak, task and explain (PD-081)", () => {
    expect([...REVIEW_EXERCISE_TYPES].sort()).toEqual(
      EXERCISE_TYPES.filter((t) => !["speak", "task", "explain"].includes(t)).sort(),
    );
    expect(isReviewExerciseType("cloze")).toBe(true);
    expect(isReviewExerciseType("speak")).toBe(false);
    expect(isReviewExerciseType("task")).toBe(false);
    expect(isReviewExerciseType("explain")).toBe(false);
  });

  it("review reuses the lesson XP and hearts values (no new constant)", () => {
    const keys = Object.keys(GAME_CONFIG).filter((k) => /review/i.test(k));
    expect(keys.sort()).toEqual(["reviewIntervalsDays", "reviewSessionSize"]);
  });
});
