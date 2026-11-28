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
export { onSyncQueueChanged } from "./queue-events";
export { newUuid as newUuidForSync } from "./ids";
export { CURRENT_KEY, SYNC_META_KEY, type LocalStore, type StoreTx } from "./store";
export {
  buildGuestMigrationPayload,
  type AccountSwitchMode,
  type DeviceSnapshot,
  type LocalAccountStore,
} from "./account";
export type { CorruptRecordEvent, CorruptRecordReporter } from "./validation";
export {
  loadLocalProgress,
  progressQueryOptions,
  ProgressRepositoryProvider,
  useInvalidateProgress,
  useProgressRepositoryLoader,
  type ProgressRepositoryLoader,
} from "./hooks";
export { useOnlineStatus } from "./use-online-status";
export {
  INSTALL_DISMISS_MS,
  INSTALL_DISMISSED_KEY,
  isDismissalActive,
  isIosDevice,
  isStandaloneDisplay,
  readInstallDismissedAt,
  shouldShowInstallCard,
  writeInstallDismissedAt,
  type InstallCardInput,
  type InstallCardMode,
  type MatchMediaLike,
  type NavigatorLike,
} from "./install-prompt";
