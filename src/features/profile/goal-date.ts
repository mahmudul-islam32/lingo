/**
 * Goal date in Profile (PLT-027, ADR-015, PD-071 §1): which levels a learner can aim for,
 * the date window, validation and the copy of the row and the dialog's preview. Pure.
 */
import {
  cefrLevelIndex,
  GAME_CONFIG,
  type CefrLevel,
  type Course,
  type GoalPlan,
  type GoalPlanStatus,
  type LocalDate,
} from "@/contracts";
import { formatGoalDate } from "@/features/gamification";
import { effectiveStartLevel, startLevelOptions } from "./start-level";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Days since 1970-01-01 of a `YYYY-MM-DD`, or `null` if it isn't a real date. Same maths
 * as the gamification local-date helpers (UTC day numbers, so DST can't shift a day); kept
 * here so Profile renders with screens that mock `@/features/gamification`.
 */
function dayNumber(date: string): number | null {
  const match = LOCAL_DATE_PATTERN.exec(date);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return Math.round(ms / MS_PER_DAY);
}

function addDays(date: LocalDate, days: number): LocalDate {
  return new Date((dayNumber(date)! + days) * MS_PER_DAY).toISOString().slice(0, 10);
}

export const GOAL_DATE_LABEL = "Goal date";
export const GOAL_DATE_DIALOG_TITLE = "Your goal date";
export const GOAL_LEVEL_QUESTION = "Which level do you want to finish?";
export const GOAL_DATE_QUESTION = "By when?";
export const GOAL_DATE_NOT_SET = "Not set";
export const SET_GOAL_DATE = "Set goal date";
export const CHANGE_GOAL_DATE = "Change goal date";
export const REMOVE_GOAL_DATE = "Remove goal date";
export const GOAL_DATE_SAVED = "Goal date saved.";
export const GOAL_DATE_REMOVED = "Goal date removed.";
export const GOAL_DATE_SAVE_ERROR = "We couldn't save your goal date. Try again.";
export const GOAL_DATE_TIGHT = "This date is tight. You could pick a later date.";
/**
 * `/profile?edit=goal-date` opens the dialog (PLT-027 AC 9). Same value as GAM-013's
 * `GOAL_PLAN_EDIT_HREF` (asserted in the tests; a literal so Profile doesn't read it at load).
 */
export const GOAL_DATE_EDIT_PARAM = "edit";
export const GOAL_DATE_EDIT_VALUE = "goal-date";
export const GOAL_DATE_HREF = `/profile?${GOAL_DATE_EDIT_PARAM}=${GOAL_DATE_EDIT_VALUE}`;

export const GOAL_DATE_ERRORS = {
  empty: "Pick a date.",
  notAfterToday: "Pick a date after today.",
  tooLate: "Pick a date within 2 years.",
} as const;
export type GoalDateError = keyof typeof GOAL_DATE_ERRORS;

/**
 * Levels with content at or after the learner's effective start level, in course order
 * (AC 2). `[]` for a course without levels (e.g. en-es): the row is hidden there.
 */
export function goalLevelOptions(course: Course, startLevel: CefrLevel | null | undefined) {
  const start = effectiveStartLevel(course, startLevel);
  if (start === null) return [];
  return startLevelOptions(course).filter(
    (option) => cefrLevelIndex(option.level) >= cefrLevelIndex(start),
  );
}

/** Preselected level: the saved target if it is offered, else the last offered level. */
export function defaultGoalLevel(
  levels: readonly CefrLevel[],
  saved: GoalPlan | null | undefined,
): CefrLevel | null {
  if (saved && levels.includes(saved.targetLevel)) return saved.targetLevel;
  return levels[levels.length - 1] ?? null;
}

/** `min` = tomorrow, `max` = today + `GAME_CONFIG.goalPlanMaxDays` (ADR-015 §1). */
export function goalDateBounds(today: LocalDate): { min: LocalDate; max: LocalDate } {
  return { min: addDays(today, 1), max: addDays(today, GAME_CONFIG.goalPlanMaxDays) };
}

/** Validation on Save (AC 4); `null` when `value` is a date in the window. */
export function validateGoalDate(value: string, today: LocalDate): GoalDateError | null {
  const day = dayNumber(value);
  if (day === null) return "empty";
  const todayDay = dayNumber(today)!;
  if (day <= todayDay) return "notAfterToday";
  if (day > todayDay + GAME_CONFIG.goalPlanMaxDays) return "tooLate";
  return null;
}

/** True when `value` is a valid date in the window, i.e. the preview can be shown. */
export function isValidGoalDate(value: string, today: LocalDate): boolean {
  return validateGoalDate(value, today) === null;
}

/**
 * Row value: "Finish A2 by 12 Mar 2027" or "Not set" (AC 1). The date uses GAM-013's
 * `formatGoalDate`, so the row and the Learn card always read the same.
 */
export function goalDateRowValue(plan: GoalPlan | null | undefined): string {
  return plan
    ? `Finish ${plan.targetLevel} by ${formatGoalDate(plan.targetDate)}`
    : GOAL_DATE_NOT_SET;
}

/** Dialog preview lines for a computed status (AC 3); `[]` when there is nothing to say. */
export function goalPlanPreview(status: GoalPlanStatus | null): string[] {
  if (!status) return [];
  if (status.status === "reached") return [`You've already finished ${status.targetLevel}.`];
  if (status.lessonsPerDay === null || status.suggestedDailyGoalXp === null) return [];
  const lessons = status.lessonsLeft === 1 ? "1 lesson" : `${status.lessonsLeft} lessons`;
  const perDay = status.lessonsPerDay === 1 ? "1 lesson" : `${status.lessonsPerDay} lessons`;
  const lines = [
    `${lessons} left · about ${perDay} a day. Suggested daily goal: ${status.suggestedDailyGoalXp} XP.`,
  ];
  if (status.status === "tight") lines.push(GOAL_DATE_TIGHT);
  return lines;
}
