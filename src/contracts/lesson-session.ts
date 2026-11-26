/**
 * Lesson runtime contracts: the in-memory session (Zustand, never persisted —
 * an unfinished lesson is discarded), each attempt, and the persisted result.
 */
import { z } from "zod";
import {
  IsoDateTimeSchema,
  LocalDateSchema,
  NonNegativeIntSchema,
  SlugSchema,
  TimeZoneSchema,
  UuidSchema,
} from "./common";
import { AnswerInputSchema, AnswerOutcomeSchema } from "./answer";
import { ExerciseTypeSchema, REVIEW_SESSION_ID } from "./course";

/**
 * One submitted answer ("Check" press) within a session, or one skipped exercise.
 * `answer` is `null` when the exercise was skipped without an answer (the player's
 * "skipped" callback, e.g. listen with no audio, CR-003). A speak exercise skipped from
 * its own "Can't speak now" button keeps its speak answer (`skipped: true`).
 */
export const ExerciseAttemptSchema = z
  .object({
    exerciseId: SlugSchema,
    exerciseType: ExerciseTypeSchema,
    answer: AnswerInputSchema.nullable(),
    outcome: AnswerOutcomeSchema,
    /** Copied from `AnswerCheckResult.mistake` (PD-012). */
    mistake: z.boolean(),
    heartCost: NonNegativeIntSchema,
    /** True when this exercise was re-queued after an earlier wrong answer. */
    isRetry: z.boolean(),
    answeredAt: IsoDateTimeSchema,
  })
  .superRefine((v, ctx) => {
    if (v.answer === null && v.outcome !== "skipped") {
      ctx.addIssue({
        code: "custom",
        message: "answer may only be null for a skipped attempt",
        path: ["answer"],
      });
    }
    if (v.answer !== null && v.answer.type !== v.exerciseType) {
      ctx.addIssue({
        code: "custom",
        message: "answer type must match exerciseType",
        path: ["answer"],
      });
    }
  });
export type ExerciseAttempt = z.infer<typeof ExerciseAttemptSchema>;

export const LessonSessionStatusSchema = z.enum([
  "in_progress",
  /** All exercises answered correctly (or skipped); a LessonResult is produced. */
  "completed",
  /** Hearts hit 0 mid-lesson; no result, no XP; hearts already lost stay lost. */
  "out_of_hearts",
  /** Learner confirmed quit; nothing is saved except hearts already lost. */
  "quit",
]);
export type LessonSessionStatus = z.infer<typeof LessonSessionStatusSchema>;

/** Live state of a lesson being played (lessons feature, Zustand store). */
export const LessonSessionSchema = z.object({
  sessionId: UuidSchema,
  courseId: SlugSchema,
  unitId: SlugSchema,
  lessonId: SlugSchema,
  status: LessonSessionStatusSchema,
  startedAt: IsoDateTimeSchema,
  /** Exercise ids still to answer; `queue[0]` is the current one. Wrong answers are appended. */
  queue: z.array(SlugSchema),
  /** Exercise ids hidden for this session (e.g. speak when unsupported or disabled). */
  hiddenExerciseIds: z.array(SlugSchema),
  attempts: z.array(ExerciseAttemptSchema),
  heartsAtStart: NonNegativeIntSchema,
  heartsRemaining: NonNegativeIntSchema,
});
export type LessonSession = z.infer<typeof LessonSessionSchema>;

/** XP awarded for one completed lesson, split by rule (PD-003). */
export const XpBreakdownSchema = z.object({
  base: NonNegativeIntSchema,
  perfectBonus: NonNegativeIntSchema,
});
export type XpBreakdown = z.infer<typeof XpBreakdownSchema>;

/**
 * How one presented exercise went in a finished session (CTO-019 criterion 1, ADR-019
 * §1), from all its attempts in that session, first match wins:
 * - `skipped`: it has a `skipped` attempt (listen without audio, "Can't speak now");
 * - `correct`: its first attempt was `correct` with no mistake (match pairs: no mismatch);
 * - `incorrect`: otherwise, i.e. at least one attempt had `mistake: true` (an incorrect
 *   answer is always a mistake, `AnswerCheckResultSchema`); a correct retry later in the
 *   session doesn't change it.
 * So `correct` count = `firstTryCorrectCount` and `skipped` count = `skippedCount`.
 */
export const EXERCISE_OUTCOMES = ["correct", "incorrect", "skipped"] as const;
export const ExerciseOutcomeKindSchema = z.enum(EXERCISE_OUTCOMES);
export type ExerciseOutcomeKind = z.infer<typeof ExerciseOutcomeKindSchema>;

/**
 * One presented (not hidden) exercise of a finished session, stored in
 * `LessonResult.exerciseOutcomes` in presentation order (first presentation). Its date for
 * review scheduling is the result's `localDate`; there is no per-outcome timestamp.
 */
export const ExerciseOutcomeSchema = z.strictObject({
  /** The source lesson of the exercise; in a review result, not `REVIEW_SESSION_ID`. */
  lessonId: SlugSchema,
  exerciseId: SlugSchema,
  exerciseType: ExerciseTypeSchema,
  outcome: ExerciseOutcomeKindSchema,
});
export type ExerciseOutcome = z.infer<typeof ExerciseOutcomeSchema>;

/**
 * What a result records (CTO-019 criteria 7–8, ADR-019 §3). Missing = `"lesson"`.
 * A `review` result has `unitId = lessonId = REVIEW_SESSION_ID`. It counts for total
 * XP, today's XP, the daily goal and the streak, and **never** adds a lesson to
 * `completedLessonIds`, the path, the Practice list or the goal-plan count.
 */
export const LESSON_RESULT_KINDS = ["lesson", "review"] as const;
export const LessonResultKindSchema = z.enum(LESSON_RESULT_KINDS);
export type LessonResultKind = z.infer<typeof LessonResultKindSchema>;

/**
 * Persisted outcome of a completed lesson. Append-only and immutable; `id` is the
 * idempotency key for sync. All aggregate progress (total XP, streak, daily goal,
 * completed lessons) is derived from the set of results (ADR-002).
 */
export const LessonResultSchema = z
  .object({
    id: UuidSchema,
    courseId: SlugSchema,
    unitId: SlugSchema,
    lessonId: SlugSchema,
    startedAt: IsoDateTimeSchema,
    completedAt: IsoDateTimeSchema,
    durationMs: NonNegativeIntSchema,
    /** Distinct exercises presented (hidden ones excluded). */
    exerciseCount: z.number().int().positive(),
    /** Exercises answered correctly on the first attempt with no mistake (match pairs: no mismatch). */
    firstTryCorrectCount: NonNegativeIntSchema,
    /** Attempts with `mistake: true` (PD-012): incorrect attempts incl. retries, plus 1 per match pairs with a mismatch. */
    mistakeCount: NonNegativeIntSchema,
    /** Speak exercises skipped; excluded from accuracy. */
    skippedCount: NonNegativeIntSchema,
    /** firstTryCorrectCount / (exerciseCount - skippedCount), 1 when the denominator is 0. */
    accuracy: z.number().min(0).max(1),
    /**
     * PD-012 perfect lesson: no mistakes and at least 1 counted exercise
     * (`mistakeCount === 0 && exerciseCount - skippedCount >= 1`, CR-003).
     */
    perfect: z.boolean(),
    xp: XpBreakdownSchema,
    /** xp.base + xp.perfectBonus. */
    xpEarned: NonNegativeIntSchema,
    heartsLost: NonNegativeIntSchema,
    /** Device-local calendar date of `completedAt`; drives streak and daily goal. */
    localDate: LocalDateSchema,
    /** Device timezone at completion, kept for audit/debugging. */
    timeZone: TimeZoneSchema,
    /**
     * `"lesson"` (also when missing: every result stored before CTO-019) or `"review"`.
     * Read it with `lessonResultKind(result)`.
     */
    kind: LessonResultKindSchema.optional(),
    /**
     * One outcome per presented exercise (CTO-019, ADR-019 §1–2). Missing on results
     * stored before CTO-019 (PD-080: review history starts empty); required on a review
     * result. Saved in the same record, transaction and sync record as the result.
     */
    exerciseOutcomes: z.array(ExerciseOutcomeSchema).optional(),
  })
  .superRefine((v, ctx) => {
    if (Date.parse(v.completedAt) < Date.parse(v.startedAt)) {
      ctx.addIssue({
        code: "custom",
        message: "completedAt is before startedAt",
        path: ["completedAt"],
      });
    }
    if (v.firstTryCorrectCount + v.skippedCount > v.exerciseCount) {
      ctx.addIssue({
        code: "custom",
        message: "firstTryCorrectCount + skippedCount cannot exceed exerciseCount",
        path: ["firstTryCorrectCount"],
      });
    }
    if (v.perfect !== (v.mistakeCount === 0 && v.exerciseCount - v.skippedCount >= 1)) {
      ctx.addIssue({
        code: "custom",
        message: "perfect must equal mistakeCount === 0 with at least 1 counted exercise",
        path: ["perfect"],
      });
    }
    if (!v.perfect && v.xp.perfectBonus !== 0) {
      ctx.addIssue({
        code: "custom",
        message: "perfect bonus requires a perfect lesson",
        path: ["xp"],
      });
    }
    if (v.xpEarned !== v.xp.base + v.xp.perfectBonus) {
      ctx.addIssue({
        code: "custom",
        message: "xpEarned must equal xp.base + xp.perfectBonus",
        path: ["xpEarned"],
      });
    }
    if (v.heartsLost > v.mistakeCount) {
      ctx.addIssue({
        code: "custom",
        message: "heartsLost cannot exceed mistakeCount",
        path: ["heartsLost"],
      });
    }
    refineReviewKind(v, ctx);
    refineExerciseOutcomes(v, ctx);
  });
export type LessonResult = z.infer<typeof LessonResultSchema>;

/** `result.kind`, with missing read as `"lesson"` (CTO-019 criterion 7). */
export function lessonResultKind(result: Pick<LessonResult, "kind">): LessonResultKind {
  return result.kind ?? "lesson";
}

/** True for a review result: it never completes a lesson (CTO-019 criterion 8). */
export function isReviewResult(result: Pick<LessonResult, "kind">): boolean {
  return lessonResultKind(result) === "review";
}

type ResultRefineInput = Pick<
  LessonResult,
  | "kind"
  | "unitId"
  | "lessonId"
  | "exerciseCount"
  | "firstTryCorrectCount"
  | "skippedCount"
  | "exerciseOutcomes"
>;

/** ADR-019 §3: the reserved ids belong to review results and only to them. */
function refineReviewKind(v: ResultRefineInput, ctx: z.RefinementCtx): void {
  const review = lessonResultKind(v) === "review";
  for (const key of ["unitId", "lessonId"] as const) {
    if (review !== (v[key] === REVIEW_SESSION_ID)) {
      ctx.addIssue({
        code: "custom",
        message: review
          ? `a review result has ${key} "${REVIEW_SESSION_ID}"`
          : `"${REVIEW_SESSION_ID}" is reserved for review results`,
        path: [key],
      });
    }
  }
  if (review && (v.exerciseOutcomes === undefined || v.exerciseOutcomes.length === 0)) {
    ctx.addIssue({
      code: "custom",
      message: "a review result has at least one exercise outcome",
      path: ["exerciseOutcomes"],
    });
  }
}

/** CTO-019 criteria 2 and 5 (ADR-019 §2). */
function refineExerciseOutcomes(v: ResultRefineInput, ctx: z.RefinementCtx): void {
  const outcomes = v.exerciseOutcomes;
  if (outcomes === undefined) return;
  const path = ["exerciseOutcomes"];
  const issue = (message: string) => ctx.addIssue({ code: "custom", message, path });
  if (outcomes.length > v.exerciseCount) issue("more exercise outcomes than exerciseCount");
  const keys = outcomes.map((o) => `${o.lessonId}/${o.exerciseId}`);
  if (new Set(keys).size !== keys.length) {
    issue("at most one outcome per (lessonId, exerciseId)");
  }
  const count = (kind: ExerciseOutcomeKind) => outcomes.filter((o) => o.outcome === kind).length;
  if (count("correct") !== v.firstTryCorrectCount) {
    issue("correct outcomes must equal firstTryCorrectCount");
  }
  if (count("skipped") !== v.skippedCount) issue("skipped outcomes must equal skippedCount");
  const review = lessonResultKind(v) === "review";
  for (const o of outcomes) {
    if (review ? o.lessonId === REVIEW_SESSION_ID : o.lessonId !== v.lessonId) {
      issue(
        review
          ? "a review outcome points to its source lesson"
          : "a lesson result's outcomes belong to its lesson",
      );
      break;
    }
  }
}
