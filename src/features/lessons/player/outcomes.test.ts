/**
 * LES-023 AC 1–2, 4: per-exercise outcomes on every finished result, driven through the
 * real reducer and `checkAnswer` so the outcomes and the counters come from one session.
 */
import { describe, expect, it } from "vitest";
import {
  LessonResultSchema,
  REVIEW_SESSION_ID,
  isReviewResult,
  type AnswerInput,
  type Exercise,
  type ExerciseType,
  type Lesson,
} from "@/contracts";
import { checkAnswer } from "../checking";
import { toLessonResult } from "../results/result";
import { buildReviewLesson } from "../review/review-lesson";
import { reviewItems } from "../review/testing/fixtures";
import { createPlayerState, sessionReducer, type PlayerState } from "./session-reducer";
import { exerciseOutcomesOf, summarizeSession, type ReviewSource } from "./summary";
import { fixtureLesson, SESSION_ID } from "./testing/fixtures";

const RESULT_ID = "1b2c3d4e-5f60-4718-8a9b-0c1d2e3f4a5b";
const ALL_TYPES = new Set<ExerciseType>([
  "multiple_choice",
  "word_bank_translate",
  "match_pairs",
  "listen",
  "speak",
]);
let tick = Date.parse("2026-11-26T10:00:00.000Z");
const now = () => new Date((tick += 1000));

function start(lesson: Lesson, hiddenIds: string[] = []): PlayerState {
  return createPlayerState({
    lesson,
    supportedTypes: ALL_TYPES,
    hiddenIds,
    now: now(),
    sessionId: SESSION_ID,
  });
}

function current(state: PlayerState): Exercise {
  const exercise = state.currentId ? state.exercises[state.currentId] : undefined;
  if (!exercise) throw new Error("no current exercise");
  return exercise;
}

function answerAndContinue(state: PlayerState, answer: AnswerInput): PlayerState {
  const exercise = current(state);
  const result = checkAnswer({ exercise, answer });
  const checked = sessionReducer(state, { type: "check", answer, result, now: now() });
  return sessionReducer(checked, { type: "continue", now: now() });
}

/** A right or wrong answer for the exercise on screen. */
function answerFor(exercise: Exercise, right: boolean, mismatchCount = 0): AnswerInput {
  switch (exercise.type) {
    case "multiple_choice":
      return {
        type: "multiple_choice",
        optionId: right
          ? exercise.correctOptionId
          : exercise.options.find((o) => o.id !== exercise.correctOptionId)!.id,
      };
    case "word_bank_translate":
      return {
        type: "word_bank_translate",
        tiles: right ? exercise.answers[0]!.split(" ") : ["nope"],
      };
    case "match_pairs":
      return {
        type: "match_pairs",
        matches: exercise.pairs.map((p) => ({ learningPairId: p.id, knownPairId: p.id })),
        mismatchCount,
      };
    default:
      throw new Error(`no answer helper for ${exercise.type}`);
  }
}

function finish(state: PlayerState, review?: ReviewSource) {
  expect(state.session.status).toBe("completed");
  const summary = summarizeSession(state.session, state.completedAt!, undefined, review);
  return { summary, result: toLessonResult(summary, { id: RESULT_ID, timeZone: "UTC" }) };
}

describe("exercise outcomes in a lesson result (AC 1)", () => {
  /** mc-1 wrong then right, mc-2 right, mp-1 with a mismatch, sp-1 hidden, li-1 skipped. */
  function playFixtureLesson(): PlayerState {
    let state = start(fixtureLesson, ["sp-1"]);
    state = answerAndContinue(state, answerFor(current(state), false)); // mc-1 wrong
    state = answerAndContinue(state, answerFor(current(state), true)); // mc-2
    state = answerAndContinue(state, answerFor(current(state), true, 2)); // mp-1, mismatches
    expect(current(state).id).toBe("li-1");
    state = sessionReducer(state, { type: "skip", reason: "audio_unavailable", now: now() });
    expect(current(state).id).toBe("mc-1");
    return answerAndContinue(state, answerFor(current(state), true)); // mc-1 retry
  }

  it("wrong-then-right is incorrect, a mismatch is incorrect, a skipped listen is skipped, a hidden speak has none", () => {
    const { result } = finish(playFixtureLesson());
    expect(result.kind).toBeUndefined();
    expect(result.exerciseOutcomes).toEqual([
      {
        lessonId: "u1-l1-test",
        exerciseId: "mc-1",
        exerciseType: "multiple_choice",
        outcome: "incorrect",
      },
      {
        lessonId: "u1-l1-test",
        exerciseId: "mc-2",
        exerciseType: "multiple_choice",
        outcome: "correct",
      },
      {
        lessonId: "u1-l1-test",
        exerciseId: "mp-1",
        exerciseType: "match_pairs",
        outcome: "incorrect",
      },
      { lessonId: "u1-l1-test", exerciseId: "li-1", exerciseType: "listen", outcome: "skipped" },
    ]);
    expect(result.exerciseOutcomes?.some((o) => o.exerciseId === "sp-1")).toBe(false);
  });

  it("the outcome counts match the counters and the result parses (CTO-019 criterion 5)", () => {
    const { result } = finish(playFixtureLesson());
    const outcomes = result.exerciseOutcomes ?? [];
    expect(outcomes.filter((o) => o.outcome === "correct")).toHaveLength(
      result.firstTryCorrectCount,
    );
    expect(outcomes.filter((o) => o.outcome === "skipped")).toHaveLength(result.skippedCount);
    expect(outcomes).toHaveLength(result.exerciseCount);
    expect(result.firstTryCorrectCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(LessonResultSchema.safeParse(result).success).toBe(true);
  });

  it("a perfect lesson gives one correct outcome per presented exercise", () => {
    let state = start(fixtureLesson, ["sp-1", "li-1"]);
    while (state.session.status === "in_progress") {
      state = answerAndContinue(state, answerFor(current(state), true));
    }
    const { result } = finish(state);
    expect(result.exerciseOutcomes?.map((o) => o.outcome)).toEqual([
      "correct",
      "correct",
      "correct",
    ]);
    expect(result.perfect).toBe(true);
  });

  it("a speak skipped from its own button is skipped", () => {
    let state = start(fixtureLesson, ["li-1"]);
    for (let i = 0; i < 3; i += 1)
      state = answerAndContinue(state, answerFor(current(state), true));
    expect(current(state).id).toBe("sp-1");
    state = answerAndContinue(state, { type: "speak", skipped: true, transcripts: [] });
    const { result } = finish(state);
    expect(result.exerciseOutcomes?.at(-1)).toMatchObject({
      exerciseId: "sp-1",
      outcome: "skipped",
    });
    expect(result.skippedCount).toBe(1);
  });
});

describe("quit and out-of-hearts sessions (AC 2)", () => {
  it("a quit session is not completed, so it has no summary or result", () => {
    let state = start(fixtureLesson);
    state = answerAndContinue(state, answerFor(current(state), false));
    state = sessionReducer(state, { type: "quit" });
    expect(state.session.status).toBe("quit");
    expect(state.completedAt).toBeNull();
  });

  it("an out-of-hearts session ends without a completion time", () => {
    let state = createPlayerState({
      lesson: fixtureLesson,
      supportedTypes: ALL_TYPES,
      now: now(),
      sessionId: SESSION_ID,
      heartsAtStart: 1,
      heartsEnforced: true,
    });
    state = answerAndContinue(state, answerFor(current(state), false));
    expect(state.session.status).toBe("out_of_hearts");
    expect(state.completedAt).toBeNull();
  });
});

describe("review result (AC 4)", () => {
  function playReview(wrongFirst: boolean) {
    const built = buildReviewLesson(reviewItems)!;
    let state = start(built.lesson);
    let first = true;
    while (state.session.status === "in_progress") {
      state = answerAndContinue(state, answerFor(current(state), !(wrongFirst && first)));
      first = false;
    }
    return finish(state, built.review);
  }

  it("is marked as a review with the reserved ids, and each outcome has its source lesson", () => {
    const { result } = playReview(false);
    expect(isReviewResult(result)).toBe(true);
    expect(result).toMatchObject({
      kind: "review",
      unitId: REVIEW_SESSION_ID,
      lessonId: REVIEW_SESSION_ID,
    });
    expect(result.courseId).toBe("en-es");
    expect(result.exerciseOutcomes).toEqual([
      {
        lessonId: "u1-l1",
        exerciseId: "rv-mc",
        exerciseType: "multiple_choice",
        outcome: "correct",
      },
      {
        lessonId: "u2-l3",
        exerciseId: "rv-wb",
        exerciseType: "word_bank_translate",
        outcome: "correct",
      },
      { lessonId: "u1-l1", exerciseId: "rv-mp", exerciseType: "match_pairs", outcome: "correct" },
    ]);
    expect(LessonResultSchema.safeParse(result).success).toBe(true);
  });

  it("a wrong answer is re-queued at the end and its outcome is incorrect", () => {
    const { summary, result } = playReview(true);
    expect(summary.session.attempts.map((a) => a.exerciseId)).toEqual([
      "rv-mc",
      "rv-wb",
      "rv-mp",
      "rv-mc",
    ]);
    expect(result.exerciseOutcomes?.[0]).toMatchObject({
      exerciseId: "rv-mc",
      outcome: "incorrect",
    });
    expect(result.firstTryCorrectCount).toBe(2);
    expect(LessonResultSchema.safeParse(result).success).toBe(true);
  });

  it("throws instead of saving when an exercise has no source lesson", () => {
    const built = buildReviewLesson(reviewItems)!;
    let state = start(built.lesson);
    while (state.session.status === "in_progress") {
      state = answerAndContinue(state, answerFor(current(state), true));
    }
    const summary = summarizeSession(state.session, state.completedAt!, undefined, {
      sourceLessonIds: {},
    });
    expect(() => toLessonResult(summary, { id: RESULT_ID, timeZone: "UTC" })).toThrow(
      /source lesson/,
    );
  });
});

describe("exerciseOutcomesOf", () => {
  it("is empty for a session without attempts", () => {
    expect(exerciseOutcomesOf(start(fixtureLesson).session)).toEqual([]);
  });
});
