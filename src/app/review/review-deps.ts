"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { ReviewSelection, Slug } from "@/contracts";
import { useReviewQueue } from "@/features/gamification";
import { queryKeys } from "@/lib/query";

/**
 * What `/review` reads from GAM-015's `useReviewQueue`: the course's ranked selection
 * (`ReviewSelection`), its loading and error state and a re-read.
 */
export interface ReviewQueueState {
  selection: ReviewSelection | undefined;
  isPending: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
}
export type UseReviewQueue = (courseId: Slug) => ReviewQueueState;

/**
 * `useReviewQueue({ courseId })` (GAM-015) as a `ReviewQueueState`. The queue is derived
 * from the `["progress", courseId]` and `["content", courseId]` caches, so a re-read
 * refetches those (the save already invalidates progress, PLT-029 AC 12).
 */
export const useActiveReviewQueue: UseReviewQueue = (courseId) => {
  const queue = useReviewQueue({ courseId });
  const client = useQueryClient();
  const { status, candidates, dueCount, eligibleCount } = queue;
  const selection = useMemo(
    () =>
      status === "success" ? { candidates: [...candidates], dueCount, eligibleCount } : undefined,
    [status, candidates, dueCount, eligibleCount],
  );
  const refetch = useCallback(
    () =>
      Promise.all([
        client.refetchQueries({ queryKey: queryKeys.progress(courseId) }),
        client.refetchQueries({ queryKey: queryKeys.content(courseId) }),
      ]),
    [client, courseId],
  );
  return {
    selection,
    isPending: status === "loading",
    error: status === "error" ? new Error("review queue read failed") : null,
    refetch,
  };
};
