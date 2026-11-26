import {
  GAME_CONFIG,
  isReviewExerciseType,
  ReviewItemSchema,
  type Lesson,
  type ReviewCandidate,
  type ReviewItem,
  type Slug,
} from "@/contracts";
import { ContentError } from "@/lib/content";

export interface LoadReviewItemsInput {
  courseId: Slug;
  /** Ranked candidates of the selection rule (GAM-015), best first. */
  candidates: readonly ReviewCandidate[];
  loadLesson: (courseId: Slug, lessonId: Slug) => Promise<Lesson>;
  /** Default `GAME_CONFIG.reviewSessionSize`. */
  size?: number;
}

export type LoadReviewItemsResult =
  | { status: "ok"; items: ReviewItem[] }
  /** Nothing to review: no candidate, or no candidate's lesson or exercise exists. */
  | { status: "empty" }
  /** Every lesson that was tried failed with a network or storage error (AC 10). */
  | { status: "error"; error: unknown };

/**
 * PLT-029 AC 5, 10, 11: walks the ranked candidates **in order** and loads their lessons
 * (each lesson once) until it has `size` items whose exercise exists in the loaded lesson.
 * A candidate whose lesson is unknown or invalid (`ContentError`), whose exercise is gone,
 * or whose type is not reviewable is skipped. A lesson that fails for another reason
 * (offline, storage) is skipped too; only when every lesson tried failed that way (and so
 * nothing loaded) is the result an error. Lessons are loaded one after another, so a
 * session never loads more lessons than it needs.
 */
export async function loadReviewItems({
  courseId,
  candidates,
  loadLesson,
  size = GAME_CONFIG.reviewSessionSize,
}: LoadReviewItemsInput): Promise<LoadReviewItemsResult> {
  const lessons = new Map<Slug, Lesson | null>();
  const items: ReviewItem[] = [];
  let loaded = 0;
  let failed = 0;
  let firstError: unknown = null;

  for (const candidate of candidates) {
    if (items.length >= size) break;
    if (!lessons.has(candidate.lessonId)) {
      try {
        lessons.set(candidate.lessonId, await loadLesson(courseId, candidate.lessonId));
        loaded += 1;
      } catch (error) {
        lessons.set(candidate.lessonId, null);
        if (!(error instanceof ContentError)) {
          failed += 1;
          firstError ??= error;
        }
      }
    }
    const lesson = lessons.get(candidate.lessonId);
    const exercise = lesson?.exercises.find((e) => e.id === candidate.exerciseId);
    if (!lesson || !exercise || !isReviewExerciseType(exercise.type)) continue;
    const item = ReviewItemSchema.safeParse({
      courseId,
      unitId: lesson.unitId,
      lessonId: lesson.id,
      exercise,
    });
    if (item.success) items.push(item.data);
  }

  if (items.length > 0) return { status: "ok", items };
  if (failed > 0 && loaded === 0) return { status: "error", error: firstError };
  return { status: "empty" };
}
