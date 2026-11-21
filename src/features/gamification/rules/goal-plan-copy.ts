/**
 * Copy of the Learn goal card (GAM-013 AC9–AC14, PD-035, PD-071). Pure: the card renders
 * what this returns, so the wording is unit-testable without React.
 *
 * Tone: kind and practical. Never a pass promise or a deadline threat; no text contains
 * the whole words in `GOAL_PLAN_BANNED_WORDS` (AC14).
 */
import type { DailyGoalXp, GoalPlanStatus, LocalDate } from "@/contracts";

/** Accessible name of the card's `section` (AC15). */
export const GOAL_PLAN_SECTION_LABEL = "Goal date";

/** Where "Set a goal date" / "Change date" lead by default (PLT-027 opens the dialog). */
export const GOAL_PLAN_EDIT_HREF = "/profile?edit=goal-date";

/** Whole words the card never shows, case insensitive (AC14). "later" is allowed. */
export const GOAL_PLAN_BANNED_WORDS = ["exam", "test", "pass", "behind", "late", "failed"] as const;

export const GOAL_PLAN_EMPTY_PROMPT = "Have a date in mind?";
export const GOAL_PLAN_EMPTY_LINK = "Set a goal date";
export const GOAL_PLAN_CHANGE_LINK = "Change date";
export const GOAL_PLAN_NEW_LINK = "Set a new goal date";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** `2027-03-12` → "12 Mar 2027". Read as a UTC calendar date, so no zone can shift it. */
export function formatGoalDate(date: LocalDate): string {
  return DATE_FORMAT.format(new Date(`${date}T00:00:00Z`));
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export interface GoalPlanCopy {
  /** "Goal: finish A2 by 12 Mar 2027" (every status). */
  title: string;
  /** "130 lessons left · 111 days to go"; `null` for `reached` / `date-passed`. */
  counts: string | null;
  /** The status line (announced politely on change). */
  message: string;
  /** "Use <n> XP a day" button, if the status offers one. */
  suggestion: { label: string; xp: DailyGoalXp; variant: "primary" | "secondary" } | null;
  /** Text of the link that edits the goal date, if any. */
  editLink: string | null;
}

/** Card copy for one status. `dailyGoalXp` is the learner's current goal (on-track line). */
export function goalPlanCopy(status: GoalPlanStatus, dailyGoalXp: DailyGoalXp): GoalPlanCopy {
  const title = `Goal: finish ${status.targetLevel} by ${formatGoalDate(status.targetDate)}`;
  const counts = `${plural(status.lessonsLeft, "lesson", "lessons")} left · ${plural(
    status.daysLeft,
    "day",
    "days",
  )} to go`;
  const perDay = plural(status.lessonsPerDay ?? 0, "lesson", "lessons");
  const suggestion = (variant: "primary" | "secondary") =>
    status.suggestedDailyGoalXp === null
      ? null
      : {
          label: `Use ${status.suggestedDailyGoalXp} XP a day`,
          xp: status.suggestedDailyGoalXp,
          variant,
        };

  switch (status.status) {
    case "on-track":
      return {
        title,
        counts,
        message: `On track. Your daily goal of ${dailyGoalXp} XP gets you there.`,
        suggestion: null,
        editLink: null,
      };
    case "raise-goal":
      return {
        title,
        counts,
        message: `Aim for about ${perDay} a day to get there.`,
        suggestion: suggestion("primary"),
        editLink: null,
      };
    case "tight":
      return {
        title,
        counts,
        message: `This date is tight: about ${perDay} a day. You could pick a later date.`,
        suggestion: suggestion("secondary"),
        editLink: GOAL_PLAN_CHANGE_LINK,
      };
    case "reached":
      return {
        title,
        counts: null,
        message: `You've finished ${status.targetLevel}. Well done!`,
        suggestion: null,
        editLink: GOAL_PLAN_NEW_LINK,
      };
    case "date-passed":
      return {
        title,
        counts: null,
        message: "Your goal date has come. Pick a new date to keep a plan.",
        suggestion: null,
        editLink: GOAL_PLAN_CHANGE_LINK,
      };
  }
}
