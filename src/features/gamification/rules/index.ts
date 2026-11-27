export type { HeartsConfig, XpConfig } from "./config";
export { calculateXp, computeLessonXp, deriveXpEvents, isPerfectLesson, totalXp } from "./xp";
export type { LessonXp, LessonXpSummary } from "./xp";
export { computeStreak } from "./streak";
export {
  canStartLesson,
  createFullHearts,
  gainHearts,
  loseHearts,
  refillHearts,
  viewHearts,
  type StartGateConfig,
  type StartGateHearts,
} from "./hearts";
export { computeDailyGoalProgress, dailyGoalFraction } from "./daily-goal";
export { addDays, dayNumberToLocalDate, localDateToDayNumber, toLocalDate } from "./local-date";
export { completedLessonIdsOf, computeUserProgress } from "./progress";
export {
  reviewIntervalDays,
  reviewSchedule,
  selectReviewItems,
  type ReviewScheduleEntry,
} from "./review";
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
export { formatHeartRefill, formatHeartsFull, formatRoundedDuration } from "./hearts-format";
export { lumiPoseForStreak } from "./lumi-pose";
export {
  formatStreakAdjective,
  STREAK_UNAVAILABLE_LABEL,
  streakAccessibleName,
  streakMessage,
} from "./streak-message";
export { HEARTS_FULL_TEXT, heartsRuleText } from "./hearts-rule-text";
export { courseChip, courseLanguageOf, languageName, type CourseChip } from "./course-chip";
export { weekStartOf, weeklyXp } from "./weekly-xp";
export { computeGoalPlan, levelsWithContent, suggestDailyGoalXp } from "./goal-plan";
export {
  GOAL_PLAN_BANNED_WORDS,
  GOAL_PLAN_CHANGE_LINK,
  GOAL_PLAN_EDIT_HREF,
  GOAL_PLAN_EMPTY_LINK,
  GOAL_PLAN_EMPTY_PROMPT,
  GOAL_PLAN_NEW_LINK,
  GOAL_PLAN_SECTION_LABEL,
  formatGoalDate,
  goalPlanCopy,
  type GoalPlanCopy,
} from "./goal-plan-copy";
