/**
 * The sync engine, push half (PLT-014, ADR-020 §5 and §7). Implements `SyncEngine`
 * (contract `api.ts`).
 *
 * - Runs only for an `account` identity whose `userId` equals the session user; a guest
 *   device never sends a request.
 * - A round pushes the latest `settings`, `profile` and `hearts` record (coalesced, LWW),
 *   then `lesson_result` records by `createdAt` in batches of 100 (idempotent by id).
 * - 2xx removes the record; network, timeout and 5xx keep it with a backoff; another 4xx
 *   rejects only that record (a failed batch is retried one by one to find it); a 401
 *   refreshes the session once, then pauses the engine with status `error` and reports
 *   the session as expired. Records are never lost.
 * - One round at a time per device (Web Lock or lease) and per engine (shared promise).
 * - After a push round it runs the pull (PLT-015) when one is registered.
 */
import type { SyncPushResult, SyncQueueRecord, SyncRecordKind, SyncStatus } from "@/contracts";
import type { LocalSession } from "@/lib/offline";
import { backoffDelayMs, LAST_ERROR_MAX, SYNC_TIMINGS } from "./config";
import type { SyncLock } from "./lock";
import {
  toHeartsRow,
  toLessonResultRow,
  toProfileRow,
  toSettingsRow,
  type LessonResultRow,
  type OneRowTable,
} from "./mapping";
import { readSyncMeta, writeSyncMeta } from "./meta";
import type { SyncTransport, TransportResult } from "./transport";

/** Why the engine is paused (status `error`) until something changes. */
export type PauseReason = "session-expired" | "other-account" | null;

export interface SyncSnapshot {
  status: SyncStatus;
  /** Pending `lesson_result` records (PLT-016's "<n> results will sync"). */
  pendingResults: number;
  /** Every pending record. */
  pendingTotal: number;
  rejected: number;
  /** Last round in which every due record was accepted (ISO), or `null`. */
  lastPushAt: string | null;
  paused: PauseReason;
}

export interface PullRunner {
  (ctx: {
    local: LocalSession;
    userId: string;
    transport: SyncTransport;
  }): Promise<"ok" | "failed" | "unauthorized">;
}

export interface SyncEngineDeps {
  loadLocal: () => Promise<LocalSession>;
  transport: SyncTransport;
  lock: (local: LocalSession) => SyncLock;
  now?: () => Date;
  random?: () => number;
  online?: () => boolean;
  /** The server refused the session after a refresh (PLT-014 criterion 5). */
  onSessionExpired?: () => void;
  /** Runs after every push round (PLT-015). */
  pull?: PullRunner;
  /** After a round changed data (other tabs reload through the channel). */
  onSynced?: (changed: { pushed: boolean; pulled: boolean }) => void;
  log?: (message: string, data: Record<string, unknown>) => void;
}

export interface LocalSyncEngine {
  status(): SyncStatus;
  subscribe(listener: (status: SyncStatus) => void): () => void;
  syncNow(): Promise<SyncPushResult>;
  pending(): Promise<SyncQueueRecord[]>;
  snapshot(): SyncSnapshot;
  subscribeSnapshot(listener: (snapshot: SyncSnapshot) => void): () => void;
  /** Re-reads the queue counts (e.g. after an enqueue or another tab's round). */
  refreshCounts(): Promise<void>;
  /** Clears a pause after a new log-in (PLT-014 criterion 5). */
  resume(): void;
  setOffline(offline: boolean): void;
}

const ONE_ROW_KINDS = ["settings", "profile", "hearts"] as const;
const TABLE: Record<(typeof ONE_ROW_KINDS)[number], OneRowTable> = {
  settings: "settings",
  profile: "profiles",
  hearts: "hearts_state",
};

const emptyResult = (): SyncPushResult => ({ acceptedIds: [], duplicateIds: [], rejected: [] });

type Outcome = "done" | "transient" | "unauthorized";

export function createSyncEngine(deps: SyncEngineDeps): LocalSyncEngine {
  const now = deps.now ?? (() => new Date());
  const random = deps.random ?? Math.random;
  const online = deps.online ?? (() => typeof navigator === "undefined" || navigator.onLine);
  const log = deps.log ?? ((message, data) => console.warn(`[sync] ${message}`, data));

  let state: SyncSnapshot = {
    status: online() ? "idle" : "offline",
    pendingResults: 0,
    pendingTotal: 0,
    rejected: 0,
    lastPushAt: null,
    paused: null,
  };
  const statusListeners = new Set<(status: SyncStatus) => void>();
  const snapshotListeners = new Set<(snapshot: SyncSnapshot) => void>();
  let inFlight: Promise<SyncPushResult> | null = null;
  let metaLoaded = false;

  function update(patch: Partial<SyncSnapshot>) {
    const prev = state;
    state = { ...state, ...patch };
    if (prev.status !== state.status) statusListeners.forEach((l) => l(state.status));
    if (
      prev.status !== state.status ||
      prev.pendingResults !== state.pendingResults ||
      prev.pendingTotal !== state.pendingTotal ||
      prev.rejected !== state.rejected ||
      prev.lastPushAt !== state.lastPushAt ||
      prev.paused !== state.paused
    ) {
      snapshotListeners.forEach((l) => l(state));
    }
  }

  async function counts(local: LocalSession) {
    const all = await local.syncQueue.list();
    const pending = all.filter((r) => r.status === "pending");
    if (!metaLoaded) {
      metaLoaded = true;
      const meta = await local.store.transaction("r", (tx) => readSyncMeta(tx));
      if (meta.lastPushAt && !state.lastPushAt) update({ lastPushAt: meta.lastPushAt });
    }
    update({
      pendingTotal: pending.length,
      pendingResults: pending.filter((r) => r.kind === "lesson_result").length,
      rejected: all.length - pending.length,
    });
  }

  async function retryLater(local: LocalSession, records: SyncQueueRecord[], res: TransportResult) {
    const at = now().getTime();
    for (const record of records) {
      const attemptCount = record.attemptCount + 1;
      await local.syncQueue.update({
        ...record,
        attemptCount,
        nextAttemptAt: new Date(at + backoffDelayMs(attemptCount, random())).toISOString(),
        lastError: describe(res),
      });
    }
  }

  async function reject(
    local: LocalSession,
    record: SyncQueueRecord,
    reason: string,
    result: SyncPushResult,
  ) {
    const lastError = reason.slice(0, LAST_ERROR_MAX);
    await local.syncQueue.update({ ...record, status: "rejected", lastError });
    result.rejected.push({ id: record.id, reason: lastError });
    // Ids and codes only: never an email, a token or lesson content (criterion 10).
    log("record rejected", { id: record.id, kind: record.kind, reason: lastError });
  }

  async function pushOneRow(
    local: LocalSession,
    userId: string,
    due: SyncQueueRecord[],
    result: SyncPushResult,
  ): Promise<Outcome> {
    let outcome: Outcome = "done";
    const profile = await local.profile.getProfile();
    for (const kind of ONE_ROW_KINDS) {
      const ofKind = due.filter((r) => r.kind === kind);
      const latest = ofKind.at(-1);
      if (!latest) continue;
      let row: Record<string, unknown>;
      try {
        row = oneRow(latest, userId, profile.joinedAt);
      } catch {
        await reject(local, latest, "invalid payload", result);
        continue;
      }
      const res = await deps.transport.upsertRow(TABLE[kind], row);
      if (res.ok) {
        for (const r of ofKind) await local.syncQueue.remove(r.id);
        result.acceptedIds.push(latest.id);
      } else if (res.kind === "unauthorized") {
        return "unauthorized";
      } else if (res.kind === "rejected") {
        await reject(local, latest, describe(res), result);
      } else {
        await retryLater(local, [latest], res);
        outcome = "transient";
      }
    }
    return outcome;
  }

  async function pushResults(
    local: LocalSession,
    due: SyncQueueRecord[],
    result: SyncPushResult,
  ): Promise<Outcome> {
    const records = due.filter((r) => r.kind === "lesson_result");
    const size = SYNC_TIMINGS.lessonResultBatchSize;
    for (let i = 0; i < records.length; i += size) {
      const batch: { record: SyncQueueRecord; row: LessonResultRow }[] = [];
      for (const record of records.slice(i, i + size)) {
        try {
          batch.push({ record, row: toLessonResultRow(record.payload as never) });
        } catch {
          await reject(local, record, "invalid payload", result);
        }
      }
      if (batch.length === 0) continue;
      const res = await deps.transport.insertLessonResults(batch.map((b) => b.row));
      if (res.ok) {
        for (const { record } of batch) {
          await local.syncQueue.remove(record.id);
          result.acceptedIds.push(record.id);
        }
        continue;
      }
      if (res.kind === "unauthorized") return "unauthorized";
      if (res.kind !== "rejected") {
        await retryLater(
          local,
          batch.map((b) => b.record),
          res,
        );
        return "transient";
      }
      // A 4xx for the batch: one by one, so only the bad record is rejected.
      for (const { record, row } of batch) {
        const one = batch.length === 1 ? res : await deps.transport.insertLessonResults([row]);
        if (one.ok) {
          await local.syncQueue.remove(record.id);
          result.acceptedIds.push(record.id);
        } else if (one.kind === "unauthorized") {
          return "unauthorized";
        } else if (one.kind === "rejected") {
          await reject(local, record, describe(one), result);
        } else {
          await retryLater(local, [record], one);
          return "transient";
        }
      }
    }
    return "done";
  }

  async function push(local: LocalSession, userId: string, result: SyncPushResult) {
    const due = await local.syncQueue.listDue(now());
    let outcome = await pushOneRow(local, userId, due, result);
    if (outcome === "unauthorized") return outcome;
    const results = await pushResults(local, due, result);
    if (results !== "done") outcome = results;
    return outcome;
  }

  async function round(): Promise<SyncPushResult> {
    const result = emptyResult();
    const local = await deps.loadLocal();
    const identity = await local.profile.getIdentity();
    await counts(local);
    // Criterion 1: guests never sync (no request at all).
    if (identity.kind !== "account") {
      update({ status: online() ? "idle" : "offline" });
      return result;
    }
    if (!online()) {
      update({ status: "offline" });
      return result;
    }
    if (state.paused) return result;

    update({ status: "syncing" });
    let sessionUser: string | null;
    try {
      sessionUser = await deps.transport.sessionUserId();
    } catch {
      update({ status: "error" });
      return result;
    }
    if (!sessionUser) {
      update({ status: "error", paused: "session-expired" });
      deps.onSessionExpired?.();
      return result;
    }
    if (sessionUser !== identity.userId) {
      // ADR-020 §7: never push one user's queue into another account.
      update({ status: "error", paused: "other-account" });
      return result;
    }

    const locked = await deps.lock(local).run(async () => {
      let outcome = await push(local, identity.userId, result);
      if (outcome === "unauthorized") {
        // supabase-js refreshes once; still 401 → the session is over (criterion 5).
        outcome = (await deps.transport.refreshSession().catch(() => false))
          ? await push(local, identity.userId, result)
          : "unauthorized";
      }
      let pulled = false;
      if (outcome !== "unauthorized" && deps.pull) {
        const pull = await deps.pull({ local, userId: identity.userId, transport: deps.transport });
        pulled = pull === "ok";
        if (pull === "unauthorized") outcome = "unauthorized";
        else if (pull === "failed" && outcome === "done") outcome = "transient";
      }
      if (outcome === "done") {
        const at = now().toISOString();
        await local.store.transaction("rw", (tx) => writeSyncMeta(tx, { lastPushAt: at }));
        update({ lastPushAt: at });
      }
      return { outcome, pulled };
    });

    await counts(local);
    if (!locked.ran) {
      // Another tab holds the lock; its results reach this tab through Dexie.
      update({ status: "idle" });
      return result;
    }
    const { outcome, pulled } = locked.value;
    if (outcome === "unauthorized") {
      update({ status: "error", paused: "session-expired" });
      deps.onSessionExpired?.();
    } else {
      update({ status: online() ? (outcome === "transient" ? "error" : "idle") : "offline" });
    }
    if (result.acceptedIds.length > 0 || pulled) {
      deps.onSynced?.({ pushed: result.acceptedIds.length > 0, pulled });
    }
    return result;
  }

  return {
    status: () => state.status,
    subscribe(listener) {
      statusListeners.add(listener);
      return () => statusListeners.delete(listener);
    },
    snapshot: () => state,
    subscribeSnapshot(listener) {
      snapshotListeners.add(listener);
      return () => snapshotListeners.delete(listener);
    },
    syncNow() {
      inFlight ??= round()
        .catch((error: unknown) => {
          log("round failed", { error: error instanceof Error ? error.name : "unknown" });
          update({ status: online() ? "error" : "offline" });
          return emptyResult();
        })
        .finally(() => {
          inFlight = null;
        });
      return inFlight;
    },
    async pending() {
      const local = await deps.loadLocal();
      return (await local.syncQueue.list()).filter((r) => r.status === "pending");
    },
    async refreshCounts() {
      try {
        await counts(await deps.loadLocal());
      } catch {
        // Counts are informational.
      }
    },
    resume() {
      if (state.paused) update({ paused: null, status: online() ? "idle" : "offline" });
    },
    setOffline(offline) {
      if (offline) update({ status: "offline" });
      else if (state.status === "offline") update({ status: state.paused ? "error" : "idle" });
    },
  };
}

function oneRow(record: SyncQueueRecord, userId: string, joinedAt: string) {
  switch (record.kind) {
    case "settings":
      return toSettingsRow(record.payload, userId);
    case "profile":
      return toProfileRow(record.payload, userId, joinedAt);
    case "hearts":
      return toHeartsRow(record.payload, userId);
    default:
      throw new Error(`not a one-row kind: ${record.kind satisfies SyncRecordKind}`);
  }
}

function describe(res: TransportResult): string {
  if (res.ok) return "";
  return [res.kind, res.status || null, res.code].filter(Boolean).join(" ");
}
