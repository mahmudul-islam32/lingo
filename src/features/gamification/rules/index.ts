export type { HeartsConfig, XpConfig } from "./config";
export { calculateXp, computeLessonXp, deriveXpEvents, isPerfectLesson, totalXp } from "./xp";
export type { LessonXp, LessonXpSummary } from "./xp";
export { computeStreak } from "./streak";
export { createFullHearts, loseHearts, refillHearts, viewHearts } from "./hearts";
export { computeDailyGoalProgress, dailyGoalFraction } from "./daily-goal";
export { addDays, dayNumberToLocalDate, localDateToDayNumber, toLocalDate } from "./local-date";
export { computeUserProgress } from "./progress";
