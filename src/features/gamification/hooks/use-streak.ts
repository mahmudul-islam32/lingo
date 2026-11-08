"use client";

import type { Slug, StreakState } from "@/contracts";
import { getStreakStatus, type StreakStatus } from "../rules/streak-status";
import { useUserProgress, type ProgressStatus, type UseProgressOptions } from "./use-user-progress";

export interface StreakView {
  /** Passed through from `useUserProgress`. */
  status: ProgressStatus;
  /** `null` unless `status === "success"`. */
  streak: StreakState | null;
  /** `null` unless `status === "success"`. */
  streakStatus: StreakStatus | null;
}

/**
 * Streak and its status for a course (GAM-004). Built on `useUserProgress`: no read of
 * its own, and it follows the local date (`useLocalToday`), so `"extended"` turns into
 * `"at_risk"` at local midnight without a reload.
 */
export function useStreak(courseId: Slug, options: UseProgressOptions = {}): StreakView {
  const { status, progress } = useUserProgress(courseId, options);
  const streak = progress?.streak ?? null;
  return { status, streak, streakStatus: streak ? getStreakStatus(streak) : null };
}
