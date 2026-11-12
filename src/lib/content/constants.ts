/** Content constants (PLT-007). One course in MVP (PD-002). */
import type { Slug } from "@/contracts";

/** The course shown when no course has been chosen yet. */
export const DEFAULT_COURSE_ID: Slug = "en-es";

/** Route of a lesson: `/lesson/<lessonId>` (full screen, no bottom navigation). */
export function lessonPath(lessonId: Slug): string {
  return `/lesson/${encodeURIComponent(lessonId)}`;
}
