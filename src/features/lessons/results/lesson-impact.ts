/**
 * What the finished lesson did to the learner's streak and daily goal (LES-010). Pure.
 *
 * No streak or goal rules live here: `before` / `after` come from the gamification
 * `computeUserProgress` (which wraps `computeStreak` and `computeDailyGoalProgress`), the
 * streak event from `didExtendStreak` and the day count from `formatStreakDays`. This
 * module only maps those values to the copy of the two rows and the banner.
 *
 * Both runs use `today = result.localDate` (the lesson's own day, even after midnight) and
 * the stored results **without** this result's id, so it doesn't matter whether the save
 * has finished and the `["progress", courseId]` refetch already contains it.
 */
import type { DailyGoalProgress, HeartsState, LessonResult } from "@/contracts";
import {
  computeDailyGoalProgress,
  computeUserProgress,
  didExtendStreak,
  formatStreakDays,
  goalValueText,
  type ProgressInputs,
} from "@/features/gamification";

export const STREAK_LABEL = "Streak";
export const STREAK_STARTED_TEXT = "Streak started!";
export const STREAK_EXTENDED_TEXT = "Streak extended!";
export const GOAL_LABEL = "Daily goal";
export const GOAL_REACHED_TEXT = "Daily goal reached!";
export const STREAK_UNAVAILABLE_VALUE = "–";
export const STREAK_UNAVAILABLE_TEXT = "unavailable";

/** What `useProgressInputs(courseId)` returns (only `status`, `goalXp`, `results`, `hearts`, `now` are read). */
export type LessonImpactInputs = Pick<ProgressInputs, "status" | "goalXp" | "now"> & {
  results: readonly LessonResult[] | null;
  hearts: HeartsState | null;
};

export type StreakEvent = "started" | "extended" | null;

export interface StreakRowView {
  label: string;
  /** Visible value ("4 days" or "–"). */
  value: string;
  /** Value for screen readers ("4 days" or "unavailable"). */
  srValue: string;
  event: StreakEvent;
}

export interface GoalRowView {
  label: string;
  /** Visible value, "15 / 20 XP". */
  value: string;
  /** Value for screen readers, "15 of 20 XP". */
  srValue: string;
  goal: Pick<DailyGoalProgress, "earnedXp" | "goalXp">;
  /** At or above the goal after this lesson. */
  reached: boolean;
  /** This lesson took the learner from below the goal to at or above it. */
  newlyReached: boolean;
}

export interface LessonImpact {
  streak: StreakRowView;
  goal: GoalRowView;
  /** Banner line, or `null` when nothing is celebrated (AC 8, AC 10). */
  celebration: string | null;
}

function goalRow(
  goal: Pick<DailyGoalProgress, "earnedXp" | "goalXp" | "reached">,
  newlyReached: boolean,
): GoalRowView {
  return {
    label: newlyReached ? GOAL_REACHED_TEXT : GOAL_LABEL,
    value: goalValueText(goal),
    srValue: `${goal.earnedXp} of ${goal.goalXp} XP`,
    goal: { earnedXp: goal.earnedXp, goalXp: goal.goalXp },
    reached: goal.reached,
    newlyReached,
  };
}

/** Banner copy for the events that happened, or `null`. */
export function celebrationText(streak: StreakEvent, goalNewlyReached: boolean): string | null {
  if (streak && goalNewlyReached) return `Streak ${streak} and daily goal reached!`;
  if (streak === "started") return STREAK_STARTED_TEXT;
  if (streak === "extended") return STREAK_EXTENDED_TEXT;
  if (goalNewlyReached) return GOAL_REACHED_TEXT;
  return null;
}

/**
 * Row and banner view models, or `null` while the inputs are still loading (the rows then
 * appear as soon as the read resolves; no spinner).
 */
export function computeLessonImpact(
  result: LessonResult,
  inputs: LessonImpactInputs,
): LessonImpact | null {
  const today = result.localDate;

  if (inputs.status === "error") {
    // AC 10: no streak, this lesson's XP against the goal, nothing celebrated.
    const goal = computeDailyGoalProgress([result], inputs.goalXp, today);
    return {
      streak: {
        label: STREAK_LABEL,
        value: STREAK_UNAVAILABLE_VALUE,
        srValue: STREAK_UNAVAILABLE_TEXT,
        event: null,
      },
      goal: goalRow(goal, false),
      celebration: null,
    };
  }

  const { results, hearts } = inputs;
  if (inputs.status !== "success" || !results || !hearts) return null; // still loading

  const earlier = results.filter((r) => r.id !== result.id);
  const common = {
    courseId: result.courseId,
    hearts,
    goalXp: inputs.goalXp,
    today,
    now: inputs.now,
  };
  const before = computeUserProgress({ ...common, results: earlier });
  const after = computeUserProgress({ ...common, results: [...earlier, result] });

  const extended = didExtendStreak(before.streak, after.streak);
  // "Started" covers the first lesson ever and the first one after a broken streak.
  const event: StreakEvent = extended
    ? after.streak.current === 1
      ? "started"
      : "extended"
    : null;
  const newlyReached = !before.dailyGoal.reached && after.dailyGoal.reached;

  return {
    streak: {
      label:
        event === "started"
          ? STREAK_STARTED_TEXT
          : event === "extended"
            ? STREAK_EXTENDED_TEXT
            : STREAK_LABEL,
      value: formatStreakDays(after.streak.current),
      srValue: formatStreakDays(after.streak.current),
      event,
    },
    goal: goalRow(after.dailyGoal, newlyReached),
    celebration: celebrationText(event, newlyReached),
  };
}
