/**
 * Shared query keys (ADR-005, ARCHITECTURE §5). Every feature builds keys from here; never
 * write a key literal by hand. Each key caches exactly one shape, the raw repository fact:
 *
 * | Key                              | Cached value                                    |
 * | -------------------------------- | ----------------------------------------------- |
 * | `["progress", courseId]`         | `LessonResult[]` (`listLessonResults`)          |
 * | `["hearts"]`                     | `HeartsState` as stored (not refilled)          |
 * | `["settings"]`                   | `Settings \| null` (`findSettings`)             |
 * | `["content", courseId]`          | `Course`                                        |
 * | `["lesson", courseId, lessonId]` | `Lesson`                                        |
 * | `["profile"]`                    | `Profile \| null`                               |
 * | `["sync-status"]`                | sync engine status                              |
 *
 * Derived values (user progress, refilled hearts, path nodes) are computed with `select` /
 * `useMemo`, never stored under these keys.
 */
export const queryKeys = {
  /** All progress keys (every course): use to invalidate after a sync pull. */
  progressAll: () => ["progress"] as const,
  progress: (courseId: string) => ["progress", courseId] as const,
  hearts: () => ["hearts"] as const,
  settings: () => ["settings"] as const,
  /** All content keys (every course). */
  contentAll: () => ["content"] as const,
  content: (courseId: string) => ["content", courseId] as const,
  lesson: (courseId: string, lessonId: string) => ["lesson", courseId, lessonId] as const,
  profile: () => ["profile"] as const,
  syncStatus: () => ["sync-status"] as const,
} as const;

export type QueryKeys = typeof queryKeys;
