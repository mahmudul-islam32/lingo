/**
 * Streak status (GAM-004, PD-017): the one value every streak UI reads (top bar, Lumi,
 * results screen). Pure; the streak itself comes from `computeStreak` (GAM-002).
 */
import type { StreakState } from "@/contracts";

/**
 * - `none`: never completed a lesson.
 * - `extended`: a lesson was finished today.
 * - `at_risk`: the streak is alive but today still needs a lesson.
 * - `broken`: a full day was missed (there was a streak before).
 */
export type StreakStatus = "none" | "extended" | "at_risk" | "broken";

/** Rule order: `extendedToday`, then `current > 0`, then `longest > 0`, else `none`. */
export function getStreakStatus(
  streak: Pick<StreakState, "current" | "longest" | "extendedToday">,
): StreakStatus {
  if (streak.extendedToday) return "extended";
  if (streak.current > 0) return "at_risk";
  if (streak.longest > 0) return "broken";
  return "none";
}

/**
 * True only for the first lesson of the day: `before` was not extended today and `after`
 * is. A lesson after a broken streak counts too (it starts a new one). Used by LES-010.
 */
export function didExtendStreak(
  before: Pick<StreakState, "extendedToday">,
  after: Pick<StreakState, "extendedToday">,
): boolean {
  return !before.extendedToday && after.extendedToday;
}

/** "1 day", otherwise "N days" (including "0 days"). */
export function formatStreakDays(days: number): string {
  return days === 1 ? "1 day" : `${days} days`;
}
