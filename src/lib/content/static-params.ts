/** Build-time helpers (server components only): which lesson pages to prerender. */
import type { Slug } from "@/contracts";
import { BUNDLED_COURSE_MANIFESTS } from "./bundled-content";
import { parseCourse } from "./content-repository";
import { lessonPath } from "./constants";

/** Every lesson id of a bundled course, in course order. Throws on invalid content. */
export function bundledLessonIds(courseId: Slug): Slug[] {
  const raw = BUNDLED_COURSE_MANIFESTS[courseId];
  if (raw === undefined) return [];
  return parseCourse(raw, courseId).units.flatMap((u) => u.lessons.map((l) => l.id));
}

/** `/lesson/<id>` of every bundled lesson: the routes to precache (PLT-002 integration). */
export function bundledLessonPaths(courseId: Slug): string[] {
  return bundledLessonIds(courseId).map(lessonPath);
}
