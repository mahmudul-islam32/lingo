/**
 * Learner-facing text of the daily goal (GAM-006). Pure; numbers come from
 * `DailyGoalProgress` (the goal is the learner's setting, never a literal here).
 */
import type { DailyGoalProgress } from "@/contracts";

type GoalNumbers = Pick<DailyGoalProgress, "earnedXp" | "goalXp">;

export const DAILY_GOAL_LABEL = "Daily goal";
export const DAILY_GOAL_REACHED_TEXT = "Goal reached!";
export const DAILY_GOAL_ERROR_TEXT = "Daily goal unavailable right now.";
export const DAILY_GOAL_LOADING_TEXT = "Loading daily goal";

/** Whether `earnedXp` meets the goal (same rule as `computeDailyGoalProgress`). */
export function isGoalReached(progress: GoalNumbers): boolean {
  return progress.earnedXp >= progress.goalXp;
}

/** Visible value: "15 / 20 XP"; the real number above the goal ("25 / 20 XP"). */
export function goalValueText(progress: GoalNumbers): string {
  return `${progress.earnedXp} / ${progress.goalXp} XP`;
}

/** `aria-valuetext`: "15 of 20 XP today" or "Daily goal reached: 25 XP today". */
export function goalValueTextForScreenReaders(progress: GoalNumbers): string {
  return isGoalReached(progress)
    ? `Daily goal reached: ${progress.earnedXp} XP today`
    : `${progress.earnedXp} of ${progress.goalXp} XP today`;
}

/** Hint line: "5 XP to go", or "Goal reached!" once reached. */
export function goalHint(progress: GoalNumbers): string {
  return isGoalReached(progress)
    ? DAILY_GOAL_REACHED_TEXT
    : `${progress.goalXp - progress.earnedXp} XP to go`;
}

/** `aria-valuenow`: earned XP capped at the goal. */
export function goalAriaValueNow(progress: GoalNumbers): number {
  return Math.min(progress.earnedXp, progress.goalXp);
}
