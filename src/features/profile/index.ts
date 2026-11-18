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
export { useSetStartLevel, useUpdateSettings } from "./use-update-settings";
