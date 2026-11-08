/**
 * Lesson numbering for names and the locked toast (GAM-008 AC6, AC8): 1-based and global
 * in course-manifest order across units (Unit 2 continues after Unit 1).
 */
import type { Course, Slug } from "@/contracts";

/** 1-based number of `lessonId` in the course, or `null` if it isn't in the course. */
export function lessonNumberOf(course: Course, lessonId: Slug): number | null {
  const index = course.units
    .flatMap((unit) => unit.lessons)
    .findIndex((lesson) => lesson.id === lessonId);
  return index === -1 ? null : index + 1;
}
