/**
 * Streak copy (GAM-007 AC3, GAM-009 AC2). Pure. Tone: warm, never guilt-tripping.
 */
import { formatStreakDays, type StreakStatus } from "./streak-status";

/** "1-day streak", "3-day streak": "N-day" is a compound adjective (not `formatStreakDays`). */
export function formatStreakAdjective(days: number): string {
  return `${days}-day streak`;
}

/** The line next to Lumi (GAM-009 AC2). `current` is `StreakState.current`. */
export function streakMessage(status: StreakStatus, current: number): string {
  switch (status) {
    case "extended":
      return "You're glowing! Your streak is safe today.";
    case "at_risk":
      return `Do a lesson today to keep your ${formatStreakAdjective(current)}.`;
    case "broken":
      return "Your streak went out. Start a new one today.";
    case "none":
      return "Finish a lesson to light your first streak.";
    default: {
      const unreachable: never = status;
      throw new Error(`Unknown streak status: ${String(unreachable)}`);
    }
  }
}

/**
 * Accessible name of the top-bar streak item (GAM-007 AC2, AC3): "Streak: N days", plus
 * ", done for today" when extended or ", do a lesson today to keep it" when at risk.
 */
export function streakAccessibleName(status: StreakStatus, current: number): string {
  const base = `Streak: ${formatStreakDays(current)}`;
  if (status === "extended") return `${base}, done for today`;
  if (status === "at_risk") return `${base}, do a lesson today to keep it`;
  return base;
}

export const STREAK_UNAVAILABLE_LABEL = "Streak unavailable";
