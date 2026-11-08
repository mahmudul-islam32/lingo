/**
 * Query-option factories for gamification data (ADR-005 decision 2). Each key caches the
 * raw repository fact; derived values (refilled hearts, progress) are computed by hooks.
 */
import { queryOptions } from "@tanstack/react-query";
import type { HeartsState } from "@/contracts";
import { getLocalSession } from "@/lib/offline";
import { queryKeys } from "@/lib/query";

/**
 * `["hearts"]` = the stored `HeartsState` (not refilled). `staleTime: Infinity` and no
 * refetch on focus, so a refetch never overwrites a pending optimistic loss (ADR-005 §3).
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
