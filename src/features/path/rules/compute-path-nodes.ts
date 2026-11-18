/**
 * Skill-path unlock rule (GAM-008, US-GAM-02, ARCHITECTURE §7; start level GAM-011,
 * ADR-013, PD-064). Pure: no clock, no storage.
 */
import type {
  CefrLevel,
  ComputePathNodes,
  Course,
  PathNode,
  PathNodeState,
  Slug,
} from "@/contracts";

/**
 * Path index (0-based, course order across units) of the first lesson of `startLevel`,
 * matched on `Unit.level` (ADR-008). `0` (the first lesson of the course) when
 * `startLevel` is missing, unknown, or a level without lessons (ADR-013 §1.5), and for
 * courses without levels.
 */
export function startLessonIndex(course: Course, startLevel?: CefrLevel | null): number {
  if (!startLevel) return 0;
  let index = 0;
  for (const unit of course.units) {
    if (unit.level === startLevel && unit.lessons.length > 0) return index;
    index += unit.lessons.length;
  }
  return 0;
}

/**
 * Contract rule `ComputePathNodes`: one node per lesson, in course-manifest order across
 * units.
 *
 * - A lesson in `completedLessonIds` is `completed` (and stays playable).
 * - Start level (ADR-013): every not-completed lesson **before** the first lesson of
 *   `startLevel` is `available` ("open": playable, but not the frontier, not completed,
 *   no XP until played). Missing, unknown or contentless level = the first level, i.e.
 *   the GAM-008 rule unchanged.
 * - The first not-completed lesson at or after the first lesson of `startLevel` is the
 *   frontier: `in_progress` when it is `activeLessonId`, else `available`.
 * - Every other not-completed lesson after it is `locked`, even if a later lesson was
 *   completed out of order (e.g. L3 done but not L2: L2 available, L3 completed, L4
 *   locked). Lowering the start level relocks not-completed lessons under this rule.
 * - Ids in `completedLessonIds` that are not in the course are ignored.
 * - `activeLessonId` only marks the frontier lesson. A replayed completed lesson stays
 *   `completed`, an open earlier-level lesson stays `available`, and a locked or unknown
 *   id changes nothing (a locked lesson can't be played; PD-018).
 */
export const computePathNodes: ComputePathNodes = (
  course: Course,
  completedLessonIds: readonly Slug[],
  activeLessonId: Slug | null,
  startLevel?: CefrLevel,
): PathNode[] => {
  const completed = new Set(completedLessonIds);
  const start = startLessonIndex(course, startLevel);
  let index = 0;
  let frontierFound = false;

  return course.units.flatMap((unit) =>
    unit.lessons.map((lesson): PathNode => {
      const before = index++ < start;
      let state: PathNodeState;
      if (completed.has(lesson.id)) {
        state = "completed";
      } else if (before) {
        state = "available";
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
