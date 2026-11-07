/**
 * Daily goal rule (ARCHITECTURE §7). Compares `localDate` strings only, never instants.
 */
import type {
  ComputeDailyGoalProgress,
  DailyGoalProgress,
  DailyGoalXp,
  LessonResult,
  LocalDate,
} from "@/contracts";

/** Contract rule `ComputeDailyGoalProgress`: XP earned on `today` vs. the chosen goal. */
export const computeDailyGoalProgress: ComputeDailyGoalProgress = (
  results: readonly LessonResult[],
  goalXp: DailyGoalXp,
  today: LocalDate,
): DailyGoalProgress => {
  const earnedXp = results
    .filter((result) => result.localDate === today)
    .reduce((sum, result) => sum + result.xpEarned, 0);
  return { localDate: today, goalXp, earnedXp, reached: earnedXp >= goalXp };
};

/** Fraction of the goal reached, clamped to [0, 1], for a progress ring or bar. */
export function dailyGoalFraction(
  progress: Pick<DailyGoalProgress, "earnedXp" | "goalXp">,
): number {
  return Math.min(1, progress.earnedXp / progress.goalXp);
}
