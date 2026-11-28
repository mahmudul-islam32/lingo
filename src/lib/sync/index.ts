/** Public API of the sync engine (PLT-014 …). Import from `@/lib/sync`. */
export { backoffDelayMs, SYNC_CHANNEL_NAME, SYNC_LOCK_NAME, SYNC_TIMINGS } from "./config";
export {
  createSyncEngine,
  type LocalSyncEngine,
  type PauseReason,
  type PullRunner,
  type SyncEngineDeps,
  type SyncSnapshot,
} from "./engine";
export { deviceLock, leaseLock, webLock, type SyncLock } from "./lock";
export { toHeartsRow, toLessonResultRow, toProfileRow, toSettingsRow } from "./mapping";
export { readSyncMeta, writeSyncMeta } from "./meta";
export {
  configureSyncEngine,
  getSyncEngine,
  resetSyncEngineForTests,
  startSyncTriggers,
  useSyncStatus,
  type SyncStatusView,
  type TriggerOptions,
} from "./runtime";
export {
  classify,
  createSupabaseTransport,
  type FailureKind,
  type SyncTransport,
  type TransportResult,
} from "./transport";
