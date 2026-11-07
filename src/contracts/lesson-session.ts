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
import { ExerciseTypeSchema } from "./course";

/** One submitted answer ("Check" press) within a session. */
export const ExerciseAttemptSchema = z.object({
  exerciseId: SlugSchema,
  exerciseType: ExerciseTypeSchema,
  answer: AnswerInputSchema,
  outcome: AnswerOutcomeSchema,
  heartCost: NonNegativeIntSchema,
  /** True when this exercise was re-queued after an earlier wrong answer. */
  isRetry: z.boolean(),
  answeredAt: IsoDateTimeSchema,
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
    /** Exercises answered correctly on the first attempt. */
    firstTryCorrectCount: NonNegativeIntSchema,
    /** Total incorrect attempts (re-queued retries included). */
    mistakeCount: NonNegativeIntSchema,
    /** Speak exercises skipped; excluded from accuracy. */
    skippedCount: NonNegativeIntSchema,
    /** firstTryCorrectCount / (exerciseCount - skippedCount), 1 when the denominator is 0. */
    accuracy: z.number().min(0).max(1),
    /** No incorrect attempts at all. */
    perfect: z.boolean(),
    xp: XpBreakdownSchema,
    /** xp.base + xp.perfectBonus. */
    xpEarned: NonNegativeIntSchema,
    heartsLost: NonNegativeIntSchema,
    /** Device-local calendar date of `completedAt`; drives streak and daily goal. */
    localDate: LocalDateSchema,
    /** Device timezone at completion, kept for audit/debugging. */
    timeZone: TimeZoneSchema,
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
    if (v.perfect !== (v.mistakeCount === 0)) {
      ctx.addIssue({
        code: "custom",
        message: "perfect must equal mistakeCount === 0",
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
  });
export type LessonResult = z.infer<typeof LessonResultSchema>;
