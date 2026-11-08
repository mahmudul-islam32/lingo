/**
 * Skill-path unlock rule (GAM-008, US-GAM-02, ARCHITECTURE §7). Pure: no clock, no storage.
 */
import type { ComputePathNodes, Course, PathNode, PathNodeState, Slug } from "@/contracts";

/**
 * Contract rule `ComputePathNodes`: one node per lesson, in course-manifest order across
 * units.
 *
 * - A lesson in `completedLessonIds` is `completed` (and stays playable).
 * - The first lesson that is not completed is the frontier: `in_progress` when it is
 *   `activeLessonId`, else `available`.
 * - Every other not-completed lesson is `locked`, even if a later lesson was completed
 *   out of order (e.g. L3 done but not L2: L2 available, L3 completed, L4 locked).
 * - Ids in `completedLessonIds` that are not in the course are ignored.
 * - `activeLessonId` only marks the frontier lesson. A replayed completed lesson stays
 *   `completed`, and a locked or unknown id changes nothing (a locked lesson can't be
 *   played; PD-018).
 */
export const computePathNodes: ComputePathNodes = (
  course: Course,
  completedLessonIds: readonly Slug[],
  activeLessonId: Slug | null,
): PathNode[] => {
  const completed = new Set(completedLessonIds);
  let frontierFound = false;

  return course.units.flatMap((unit) =>
    unit.lessons.map((lesson): PathNode => {
      let state: PathNodeState;
      if (completed.has(lesson.id)) {
        state = "completed";
      } else if (frontierFound) {
        state = "locked";
      } else {
        frontierFound = true;
        state = lesson.id === activeLessonId ? "in_progress" : "available";
      }
      return { lessonId: lesson.id, unitId: unit.id, state };
    }),
  );
};
