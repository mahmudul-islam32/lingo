export type { HeartsConfig, XpConfig } from "./config";
export { calculateXp, computeLessonXp, deriveXpEvents, isPerfectLesson, totalXp } from "./xp";
export type { LessonXp, LessonXpSummary } from "./xp";
export { computeStreak } from "./streak";
export { createFullHearts, loseHearts, refillHearts, viewHearts } from "./hearts";
export { computeDailyGoalProgress, dailyGoalFraction } from "./daily-goal";
export { addDays, dayNumberToLocalDate, localDateToDayNumber, toLocalDate } from "./local-date";
export { computeUserProgress } from "./progress";
export {
  MAX_LOCAL_DATE_TIMER_MS,
  msUntilNextLocalDate,
  nextLocalDateChange,
} from "./next-local-date";
export {
  didExtendStreak,
  formatStreakDays,
  getStreakStatus,
  type StreakStatus,
} from "./streak-status";
export {
  DAILY_GOAL_ERROR_TEXT,
  DAILY_GOAL_LABEL,
  DAILY_GOAL_LOADING_TEXT,
  DAILY_GOAL_REACHED_TEXT,
  goalAriaValueNow,
  goalHint,
  goalValueText,
  goalValueTextForScreenReaders,
  isGoalReached,
} from "./daily-goal-format";
