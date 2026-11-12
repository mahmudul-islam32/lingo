/** Build-time helpers (server components only): which lesson pages to prerender. */
import { flattenCourseLessons, type Slug } from "@/contracts";
import { BUNDLED_COURSE_MANIFESTS, COURSE_REGISTRY } from "./bundled-content";
import { parseCourse } from "./content-repository";
import { lessonPath } from "./constants";

/** Ids of every bundled course (hidden ones too), in registry order. */
export function bundledCourseIds(): Slug[] {
  return COURSE_REGISTRY.map((c) => c.id);
}

/** Every lesson id of a bundled course, in course order. Throws on invalid content. */
export function bundledLessonIds(courseId: Slug): Slug[] {
  if (!Object.hasOwn(BUNDLED_COURSE_MANIFESTS, courseId)) return [];
  const raw = BUNDLED_COURSE_MANIFESTS[courseId];
  return flattenCourseLessons(parseCourse(raw, courseId)).map((entry) => entry.lesson.id);
}

/** `/lesson/<id>` of every lesson of one bundled course. */
export function bundledLessonPaths(courseId: Slug): string[] {
  return bundledLessonIds(courseId).map(lessonPath);
}

/**
 * `/lesson/<id>` of every lesson of EVERY bundled course: the routes to prerender and
 * precache (PLT-002, PLT-007, CTO-008). Lesson ids are unique across courses.
 */
export function allBundledLessonPaths(): string[] {
  return bundledCourseIds().flatMap(bundledLessonPaths);
}

/**
 * The bundled course that contains `lessonId`, or null. The lesson route has no course
 * segment, so this is how `/lesson/<lessonId>` finds its course (CTO-008).
 */
export function bundledCourseIdOfLesson(lessonId: Slug): Slug | null {
  return bundledCourseIds().find((id) => bundledLessonIds(id).includes(lessonId)) ?? null;
}
