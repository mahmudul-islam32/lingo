/**
 * Review "lesson" (LES-023, ADR-019 §3, §5): turns the `ReviewItem`s chosen by the
 * selection rule into the `Lesson` the player already knows how to play, plus the map
 * from each exercise to its source lesson for the result's outcomes. Pure.
 */
import {
  GAME_CONFIG,
  REVIEW_SESSION_ID,
  isReviewExerciseType,
  type Exercise,
  type Lesson,
  type ReviewItem,
  type Slug,
} from "@/contracts";
import type { ReviewSource } from "../player/summary";

/** Header / `main` accessible name of a review session (LES-023 AC 7). */
export const REVIEW_TITLE = "Review";

export interface ReviewLesson {
  /** `id` and `unitId` are `REVIEW_SESSION_ID`; no `tip` (AC 6). */
  lesson: Lesson;
  review: ReviewSource;
}

/**
 * Builds the review session from `items`, in the order given (AC 3). Items are kept when
 * they belong to the course of the first item, have a reviewable type
 * (`REVIEW_EXERCISE_TYPES`) and an exercise id not seen before in the list (the session
 * queue is keyed by exercise id; `SelectReviewItems` already returns one per id). At most
 * `GAME_CONFIG.reviewSessionSize` items are played. Returns `null` when nothing is left.
 */
export function buildReviewLesson(items: readonly ReviewItem[]): ReviewLesson | null {
  const courseId = items[0]?.courseId;
  if (courseId === undefined) return null;
  const exercises: Exercise[] = [];
  const sourceLessonIds: Record<Slug, Slug> = {};
  for (const item of items) {
    if (exercises.length >= GAME_CONFIG.reviewSessionSize) break;
    const { exercise } = item;
    if (item.courseId !== courseId) continue;
    if (!isReviewExerciseType(exercise.type)) continue;
    if (item.lessonId === REVIEW_SESSION_ID) continue;
    if (Object.hasOwn(sourceLessonIds, exercise.id)) continue;
    sourceLessonIds[exercise.id] = item.lessonId;
    exercises.push(exercise);
  }
  if (exercises.length === 0) return null;
  return {
    lesson: {
      id: REVIEW_SESSION_ID,
      courseId,
      unitId: REVIEW_SESSION_ID,
      title: REVIEW_TITLE,
      exercises,
    },
    review: { sourceLessonIds },
  };
}
