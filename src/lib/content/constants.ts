/** Content constants (PLT-007, CTO-008). */
import type { Slug } from "@/contracts";

/**
 * The course shown when no course has been chosen yet: German for English speakers,
 * the primary course from CTO-008 on. `en-es` stays bundled and loadable.
 */
export const DEFAULT_COURSE_ID: Slug = "en-de";

/** Route of a lesson: `/lesson/<lessonId>` (full screen, no bottom navigation). */
export function lessonPath(lessonId: Slug): string {
  return `/lesson/${encodeURIComponent(lessonId)}`;
}
