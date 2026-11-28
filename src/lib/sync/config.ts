/**
 * Sync engine timings (PLT-014, ADR-020 §5–8). The retry backoff and `maxAttempts` come from
 * `SYNC_CONFIG` in the contracts; the trigger timings below are requested there as CR-004
 * (docs/architecture/contract-requests.md) and live here until the cto decides.
 */
import { SYNC_CONFIG } from "@/contracts";

export const SYNC_TIMINGS = {
  /** Push this long after the last enqueue (debounced). */
  pushDebounceMs: 2_000,
  /** Push and pull this often while the page is visible. */
  pollIntervalMs: 60_000,
  /** Lease of the fallback lock when Web Locks are missing (ADR-020 §7). */
  lockLeaseMs: 30_000,
  /** The final sync before log-out waits at most this long (PLT-017). */
  logOutSyncTimeoutMs: 10_000,
  /** One request may take this long before it counts as a timeout. */
  requestTimeoutMs: 15_000,
  /** Lesson results per insert (ADR-020 §5). */
  lessonResultBatchSize: 100,
} as const;

/** Web Lock and `BroadcastChannel` name (ADR-020 §7). */
export const SYNC_LOCK_NAME = "polyglow-sync";
export const SYNC_CHANNEL_NAME = "polyglow-sync";

/** `lastError` is stored with at most this many characters (`SyncQueueRecordSchema`). */
export const LAST_ERROR_MAX = 500;

/**
 * Delay before attempt `attemptCount + 1`: `min(base · 2^(attemptCount − 1), max)` with
 * ±20 % jitter (`random` in [0, 1)). Pure.
 */
export function backoffDelayMs(attemptCount: number, random: number): number {
  const exp = Math.max(0, attemptCount - 1);
  const raw = Math.min(SYNC_CONFIG.retryBaseDelayMs * 2 ** exp, SYNC_CONFIG.retryMaxDelayMs);
  return Math.round(raw * (0.8 + 0.4 * random));
}
