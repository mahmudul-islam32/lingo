/**
 * The app-wide sync engine and its triggers (PLT-014 criterion 2): app start, the `online`
 * event, 2 s after the last enqueue (debounced), every 60 s while the page is visible, and
 * when the page becomes visible again. Browser only, and only with the accounts flag on.
 */
import { useSyncExternalStore } from "react";
import { getLocalSession, newUuidForSync, onSyncQueueChanged } from "@/lib/offline";
import { accountsEnabled, getSupabaseClient } from "@/lib/supabase";
import { SYNC_CHANNEL_NAME, SYNC_TIMINGS } from "./config";
import {
  createSyncEngine,
  type LocalSyncEngine,
  type SyncEngineDeps,
  type SyncSnapshot,
} from "./engine";
import { deviceLock } from "./lock";
import { createSupabaseTransport } from "./transport";

let shared: LocalSyncEngine | null = null;
let extraDeps: Partial<SyncEngineDeps> = {};

/** Hooks the app adds before the engine is created (session expiry, pull, synced). */
export function configureSyncEngine(deps: Partial<SyncEngineDeps>): void {
  extraDeps = { ...extraDeps, ...deps };
}

/** The engine, or `null` with accounts disabled or on the server. */
export function getSyncEngine(): LocalSyncEngine | null {
  if (!accountsEnabled() || typeof window === "undefined") return null;
  if (!shared) {
    const owner = newUuidForSync();
    shared = createSyncEngine({
      loadLocal: getLocalSession,
      transport: createSupabaseTransport(getSupabaseClient),
      lock: (local) => deviceLock(local.store, owner, () => new Date()),
      onSessionExpired: () => extraDeps.onSessionExpired?.(),
      pull: (ctx) => (extraDeps.pull ? extraDeps.pull(ctx) : Promise.resolve("ok")),
      onSynced: (changed) => {
        channel()?.postMessage({ type: "synced", ...changed });
        extraDeps.onSynced?.(changed);
      },
    });
  }
  return shared;
}

let broadcast: BroadcastChannel | null | undefined;
function channel(): BroadcastChannel | null {
  if (broadcast === undefined) {
    broadcast =
      typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(SYNC_CHANNEL_NAME);
  }
  return broadcast;
}

export interface TriggerOptions {
  /** Another tab finished a round (ADR-020 §7): refresh what this tab shows. */
  onRemoteSynced?: (changed: { pushed: boolean; pulled: boolean }) => void;
  timings?: Pick<typeof SYNC_TIMINGS, "pushDebounceMs" | "pollIntervalMs">;
}

/** Starts the triggers; returns `stop`. */
export function startSyncTriggers(engine: LocalSyncEngine, options: TriggerOptions = {}) {
  const timings = options.timings ?? SYNC_TIMINGS;
  let debounce: ReturnType<typeof setTimeout> | undefined;
  let dirty = false;
  const sync = () => void engine.syncNow();
  const schedule = () => {
    clearTimeout(debounce);
    debounce = setTimeout(sync, timings.pushDebounceMs);
  };

  const offQueue = onSyncQueueChanged(() => {
    void engine.refreshCounts();
    // The engine's own updates during a round don't schedule another one.
    if (engine.status() === "syncing") dirty = true;
    else schedule();
  });
  const offStatus = engine.subscribe((status) => {
    if (status !== "syncing" && dirty) {
      dirty = false;
      void engine.refreshCounts();
    }
  });
  const onOnline = () => {
    engine.setOffline(false);
    sync();
  };
  const onOffline = () => engine.setOffline(true);
  const onVisible = () => {
    if (document.visibilityState === "visible") sync();
  };
  const interval = setInterval(() => {
    if (document.visibilityState === "visible") sync();
  }, timings.pollIntervalMs);
  const bc = channel();
  const onMessage = (event: MessageEvent) => {
    const data = event.data as { type?: string; pushed?: boolean; pulled?: boolean } | null;
    if (data?.type !== "synced") return;
    void engine.refreshCounts();
    options.onRemoteSynced?.({ pushed: Boolean(data.pushed), pulled: Boolean(data.pulled) });
  };

  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  document.addEventListener("visibilitychange", onVisible);
  bc?.addEventListener("message", onMessage);
  sync();

  return () => {
    clearTimeout(debounce);
    clearInterval(interval);
    offQueue();
    offStatus();
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
    document.removeEventListener("visibilitychange", onVisible);
    bc?.removeEventListener("message", onMessage);
  };
}

const IDLE: SyncSnapshot = {
  status: "idle",
  pendingResults: 0,
  pendingTotal: 0,
  rejected: 0,
  lastPushAt: null,
  paused: null,
};

const noop = () => () => {};

export interface SyncStatusView {
  status: SyncSnapshot["status"];
  /** Pending lesson results. */
  pendingCount: number;
  pendingTotal: number;
  rejected: number;
  lastPushAt: string | null;
  paused: SyncSnapshot["paused"];
  /** Push and pull now (PLT-016 "Try now"). Never throws. */
  syncNow: () => Promise<void>;
}

/**
 * Status, pending count and last successful push for PLT-016 (PLT-014 criterion 9). With
 * accounts disabled it reports an idle engine with nothing pending.
 */
export function useSyncStatus(engine: LocalSyncEngine | null = getSyncEngine()): SyncStatusView {
  const snapshot = useSyncExternalStore(
    engine ? engine.subscribeSnapshot : noop,
    () => (engine ? engine.snapshot() : IDLE),
    () => IDLE,
  );
  return {
    status: snapshot.status,
    pendingCount: snapshot.pendingResults,
    pendingTotal: snapshot.pendingTotal,
    rejected: snapshot.rejected,
    lastPushAt: snapshot.lastPushAt,
    paused: snapshot.paused,
    syncNow: async () => {
      await engine?.syncNow();
    },
  };
}

/** Tests only. */
export function resetSyncEngineForTests(): void {
  shared = null;
  extraDeps = {};
}
