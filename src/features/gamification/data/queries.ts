/**
 * Query-option factories for the gamification reads (GAM-003, GAM-005).
 *
 * ADR-005 (binding): each key caches the raw repository fact only.
 * - `["progress", courseId]` → `LessonResult[]` (the course's stored results)
 * - `["hearts"]` → `HeartsState` as stored (never refilled; refill is derived)
 * - `["settings"]` → `Settings | null` (`null` before onboarding)
 * Derived values (`UserProgress`, hearts view, streak status) are computed in hooks.
 *
 * Reads go through `@/lib/offline` (never Dexie directly). Keys come from `queryKeys`.
 * Options are the client's offline-first defaults (`LOCAL_QUERY_DEFAULTS`: `networkMode:
 * "always"`, `retry: false`, `staleTime: Infinity`, no focus refetch), so a factory is
 * normally only `queryKey` + `queryFn`.
 */
import { queryOptions } from "@tanstack/react-query";
import type { HeartsState, LessonResult, Settings, Slug } from "@/contracts";
import { getLocalSession } from "@/lib/offline";
import { queryKeys } from "@/lib/query";

/** `["progress", courseId]`: raw results of one course. */
export function progressQuery(courseId: Slug) {
  return queryOptions({
    queryKey: queryKeys.progress(courseId),
    queryFn: async (): Promise<LessonResult[]> => {
      const session = await getLocalSession();
      return session.progress.listLessonResults(courseId);
    },
  });
}

/**
 * `["hearts"]`: the stored `HeartsState` (not refilled). `staleTime: Infinity` and no
 * refetch on focus are repeated here on purpose: they are load-bearing for this key, so a
 * refetch never overwrites a pending optimistic loss (ADR-005 §3), even if a caller's
 * client uses other defaults.
 */
export function heartsQuery() {
  return queryOptions({
    queryKey: queryKeys.hearts(),
    queryFn: async (): Promise<HeartsState> => {
      const session = await getLocalSession();
      return session.progress.getHearts();
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

/** `["settings"]`: the learner's settings, `null` before onboarding saved a goal. */
export function settingsQuery() {
  return queryOptions({
    queryKey: queryKeys.settings(),
    queryFn: async (): Promise<Settings | null> => {
      const session = await getLocalSession();
      return session.profile.findSettings();
    },
  });
}
