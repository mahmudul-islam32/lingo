/** Public API of the on-device data layer. Features import from `@/lib/offline` only. */
export { DB_NAME, DB_SCHEMA_VERSION } from "./db";
export { DEFAULT_GUEST_DISPLAY_NAME, DEFAULT_SETTINGS_TOGGLES, identityId } from "./defaults";
export {
  InvalidDailyGoalError,
  InvalidRecordError,
  LocalDataError,
  OnboardingPrerequisitesError,
  SettingsIncompleteError,
  SettingsNotSetError,
  StorageError,
  type LocalDataErrorCode,
} from "./errors";
export type {
  GuestBootstrapResult,
  LocalProfileRepository,
  LocalProgressRepository,
  SettingsPatch,
} from "./repositories";
export {
  getLocalSession,
  openLocalSession,
  resetLocalSession,
  type LocalSession,
  type OpenLocalSessionOptions,
  type StorageInfo,
} from "./session";
export type { SyncQueueStore } from "./sync-queue";
export type { CorruptRecordEvent, CorruptRecordReporter } from "./validation";
export {
  loadLocalProgress,
  ProgressRepositoryProvider,
  useCompletedLessonIds,
  useProgressRepositoryLoader,
  type CompletedLessonIds,
  type ProgressRepositoryLoader,
} from "./hooks";
export { notifyProgressChanged, subscribeProgress, type ProgressListener } from "./progress-events";
