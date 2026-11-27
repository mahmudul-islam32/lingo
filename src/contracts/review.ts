/**
 * Smart review contracts (CTO-019, ADR-019, PD-079): what the review player receives and
 * what the selection rule returns. The schedule is never stored; it is derived on the
 * device from `LessonResult.exerciseOutcomes` (`SelectReviewItems` in `api.ts`).
 */
import { z } from "zod";
import { NonNegativeIntSchema, SlugSchema } from "./common";
import { ExerciseSchema, isReviewExerciseType } from "./course";

/**
 * One exercise of a review session, with where it comes from (CTO-019 criterion 9). The
 * player plays `exercise`; the result's outcome for it gets `lessonId` (criterion 2).
 */
export const ReviewItemSchema = z
  .strictObject({
    courseId: SlugSchema,
    unitId: SlugSchema,
    /** Source lesson (never `REVIEW_SESSION_ID`, which no course may use). */
    lessonId: SlugSchema,
    exercise: ExerciseSchema,
  })
  .refine((item) => isReviewExerciseType(item.exercise.type), {
    message: "exercise type is not in REVIEW_EXERCISE_TYPES",
    path: ["exercise", "type"],
  });
export type ReviewItem = z.infer<typeof ReviewItemSchema>;

/** A ranked candidate of the selection rule: an exercise of a source lesson. */
export const ReviewCandidateSchema = z.strictObject({
  lessonId: SlugSchema,
  exerciseId: SlugSchema,
});
export type ReviewCandidate = z.infer<typeof ReviewCandidateSchema>;

/** Output of `SelectReviewItems` (GAM-015 criterion 4). */
export const ReviewSelectionSchema = z
  .strictObject({
    /**
     * Every eligible exercise, ranked, at most one per `exerciseId`. Exercise ids are
     * unique across courses (CTO-008, CTO-020), so for valid content this is every
     * eligible exercise and `candidates.length === eligibleCount`.
     */
    candidates: z.array(ReviewCandidateSchema),
    /** Eligible exercises that are due today. */
    dueCount: NonNegativeIntSchema,
    /** Eligible exercises (due or not). */
    eligibleCount: NonNegativeIntSchema,
  })
  .refine((s) => s.dueCount <= s.eligibleCount, {
    message: "dueCount cannot exceed eligibleCount",
    path: ["dueCount"],
  })
  .refine((s) => s.candidates.length <= s.eligibleCount, {
    message: "more candidates than eligible exercises",
    path: ["candidates"],
  })
  .refine((s) => new Set(s.candidates.map((c) => c.exerciseId)).size === s.candidates.length, {
    message: "at most one candidate per exerciseId",
    path: ["candidates"],
  });
export type ReviewSelection = z.infer<typeof ReviewSelectionSchema>;
