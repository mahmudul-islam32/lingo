/** Public API of the profile feature. Other features import from `@/features/profile` only. */
export {
  createGuestProfileStore,
  guestProfileStore,
  selectShowStorageNotice,
  useGuestProfile,
  type GuestProfileState,
  type GuestProfileStatus,
} from "./guest-profile-store";
export { GuestProfileBootstrap } from "./GuestProfileBootstrap";
export { STORAGE_NOTICE_TEXT, StorageUnavailableNotice } from "./StorageUnavailableNotice";
export {
  effectiveStartLevel,
  firstLessonOfLevel,
  hasStartLevelChoice,
  isLowerLevel,
  START_LEVEL_DESCRIPTIONS,
  startLevelLabel,
  startLevelOptions,
  type StartLevelOption,
} from "./start-level";
export { useSetCourse, useSetStartLevel, useUpdateSettings } from "./use-update-settings";
export {
  GUEST_NAME,
  hasChosenName,
  joinedLabel,
  profileDisplayName,
  profileInitials,
  profileSubtitle,
} from "./identity";
export {
  chartMax,
  dayXpLabel,
  weekdayIndex,
  weeklyXpByDay,
  weekStart,
  type WeekDayXp,
} from "./weekly-xp/weekly-xp";
export {
  goalLabel,
  WEEKLY_XP_EMPTY,
  WEEKLY_XP_ERROR,
  WEEKLY_XP_TITLE,
  WeeklyXpChart,
  type WeeklyXpChartProps,
} from "./weekly-xp/WeeklyXpChart";
export { ProfileHeader, type ProfileHeaderProps } from "./components/ProfileHeader";
export {
  ProfileStats,
  STATS_ERROR,
  type ProfileStatsProps,
  type ProfileStatsValues,
} from "./components/ProfileStats";
export { SettingsRow, type SettingsRowProps } from "./components/SettingsRow";
export {
  CHANGE_GOAL_DATE,
  defaultGoalLevel,
  GOAL_DATE_DIALOG_TITLE,
  GOAL_DATE_EDIT_PARAM,
  GOAL_DATE_EDIT_VALUE,
  GOAL_DATE_ERRORS,
  GOAL_DATE_HREF,
  GOAL_DATE_LABEL,
  GOAL_DATE_NOT_SET,
  GOAL_DATE_QUESTION,
  GOAL_DATE_REMOVED,
  GOAL_DATE_SAVE_ERROR,
  GOAL_DATE_SAVED,
  GOAL_DATE_TIGHT,
  GOAL_LEVEL_QUESTION,
  goalDateBounds,
  goalDateRowValue,
  goalLevelOptions,
  goalPlanPreview,
  isValidGoalDate,
  REMOVE_GOAL_DATE,
  SET_GOAL_DATE,
  validateGoalDate,
  type GoalDateError,
} from "./goal-date";
