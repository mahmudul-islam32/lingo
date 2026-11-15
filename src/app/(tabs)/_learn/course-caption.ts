/**
 * Learn's course caption (PLT-024 AC 7, 9): which course the learner is on and the CEFR
 * level they are working in, e.g. "German · A1". Pure; no React, no storage.
 */
import { flattenCourseLessons, type CefrLevel, type Course, type Slug } from "@/contracts";
import { COURSE_REGISTRY, DEFAULT_COURSE_ID } from "@/lib/content";

/**
 * The course Learn shows: `Settings.courseId` when it is a registered course (hidden ones
 * included, so Spanish guests keep Spanish, PD-030), else `DEFAULT_COURSE_ID` (no
 * settings yet, or a course that was removed from the app).
 */
export function learnCourseId(settingsCourseId: Slug | null | undefined): Slug {
  if (settingsCourseId && COURSE_REGISTRY.some((c) => c.id === settingsCourseId)) {
    return settingsCourseId;
  }
  return DEFAULT_COURSE_ID;
}

/**
 * The learner's current level: the level of the available lesson (the first one not
 * completed, the same frontier rule as the path), or of the last lesson once all are
 * done. `null` for courses without levels (en-es).
 */
export function currentLevel(
  course: Course,
  completedLessonIds: readonly Slug[],
): CefrLevel | null {
  const lessons = flattenCourseLessons(course);
  const completed = new Set(completedLessonIds);
  const current = lessons.find((entry) => !completed.has(entry.lesson.id)) ?? lessons.at(-1);
  return current?.level ?? null;
}

/** "German · A1", or just "Spanish" for a course without levels. */
export function courseCaption(course: Course, level: CefrLevel | null): string {
  return level === null ? course.title : `${course.title} · ${level}`;
}
