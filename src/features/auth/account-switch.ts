/**
 * Guest → account switch after a successful sign-in (PLT-013, ADR-020 §8, PD-087).
 *
 * - A device that is already this account does nothing; a device of another account is
 *   signed out again (log out first, PLT-017).
 * - **Adopt** (nothing to merge): a guest that never onboarded, or a log-in by a guest with
 *   no lesson results, becomes the account at once; its one-row data is replaced by the
 *   account's through the pull (PLT-015).
 * - **Migrate**: otherwise the `GuestMigrationPayload` is uploaded. On success the identity
 *   becomes the account and the guest's queued records are dropped; on failure nothing
 *   changes locally and the switch is retried on the next start or `online` event while
 *   the session exists (`AccountSwitchRetry`).
 */
import type { Session } from "@supabase/supabase-js";
import { createStore, useStore, type StoreApi } from "zustand";
import type { MigrateGuestToAccount, Settings } from "@/contracts";
import { buildGuestMigrationPayload, getLocalSession, type LocalSession } from "@/lib/offline";
import { guestProfileStore } from "@/features/profile";
import { migrateGuestToAccount, MigrationError, type MigrationFailure } from "./migrate";
import { sessionStore } from "./session-store";

export type SignInMethod = "sign-up" | "log-in";

export type SwitchPlan = "migrate" | "adopt";

/** PLT-013 criterion 4 (PD-087). Pure. */
export function planAccountSwitch(input: {
  method: SignInMethod;
  settings: Settings | null;
  lessonResultCount: number;
}): SwitchPlan {
  if (!input.settings) return "adopt";
  if (input.method === "log-in" && input.lessonResultCount === 0) return "adopt";
  return "migrate";
}

export type AccountSwitchOutcome =
  | { kind: "saved" }
  | { kind: "adopted" }
  | { kind: "already-account" }
  | { kind: "other-account" }
  | { kind: "failed"; reason: MigrationFailure };

export type AccountSwitchPhase = "idle" | "saving" | "saved" | "failed";

export interface AccountSwitchState {
  phase: AccountSwitchPhase;
}

/** What the "Saving your progress…" overlay and the auth screens read. */
export const accountSwitchStore: StoreApi<AccountSwitchState> = createStore<AccountSwitchState>()(
  () => ({ phase: "idle" }),
);

export function useAccountSwitchPhase(): AccountSwitchPhase {
  return useStore(accountSwitchStore, (s) => s.phase);
}

/** A switch that failed and must be retried (survives a reload; no personal data). */
export const PENDING_SWITCH_KEY = "polyglow.pendingAccountSwitch";

interface PendingSwitch {
  userId: string;
  method: SignInMethod;
}

export function readPendingSwitch(): PendingSwitch | null {
  try {
    const raw = window.localStorage.getItem(PENDING_SWITCH_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<PendingSwitch>;
    if (typeof value.userId !== "string") return null;
    return { userId: value.userId, method: value.method === "sign-up" ? "sign-up" : "log-in" };
  } catch {
    return null;
  }
}

function writePendingSwitch(value: PendingSwitch | null): void {
  try {
    if (value) window.localStorage.setItem(PENDING_SWITCH_KEY, JSON.stringify(value));
    else window.localStorage.removeItem(PENDING_SWITCH_KEY);
  } catch {
    // Storage unavailable: the retry falls back to "log-in" rules.
  }
}

export interface AccountSwitchDeps {
  loadLocal: () => Promise<LocalSession>;
  migrate: MigrateGuestToAccount;
  /** Re-reads the device data shown by the app (profile store, queries). */
  refresh: () => Promise<void>;
  /** Signs out of the session that belongs to another account. */
  signOut: () => Promise<void>;
  /** After the identity became the account: pull (PLT-015). */
  afterSwitch: () => Promise<void>;
  store: StoreApi<AccountSwitchState>;
}

/** Called after every switch; the sync engine registers its pull here (PLT-015). */
const afterSwitchListeners = new Set<() => Promise<void> | void>();

export function onAccountSwitched(listener: () => Promise<void> | void): () => void {
  afterSwitchListeners.add(listener);
  return () => afterSwitchListeners.delete(listener);
}

/** Called with fresh data after a switch, e.g. to invalidate TanStack Query caches. */
const refreshListeners = new Set<() => void>();

export function onDeviceDataReplaced(listener: () => void): () => void {
  refreshListeners.add(listener);
  return () => refreshListeners.delete(listener);
}

export const defaultAccountSwitchDeps: AccountSwitchDeps = {
  loadLocal: getLocalSession,
  migrate: migrateGuestToAccount,
  refresh: async () => {
    await guestProfileStore.getState().reload();
    refreshListeners.forEach((listener) => listener());
  },
  signOut: () => sessionStore.getState().signOutLocal(),
  afterSwitch: async () => {
    for (const listener of afterSwitchListeners) await listener();
  },
  store: accountSwitchStore,
};

let inFlight: Promise<AccountSwitchOutcome> | null = null;

/**
 * Runs the switch for `userId` once at a time (the screen and the retry share one run).
 * Never throws.
 */
export function runAccountSwitch(
  userId: string,
  method: SignInMethod,
  deps: AccountSwitchDeps = defaultAccountSwitchDeps,
): Promise<AccountSwitchOutcome> {
  inFlight ??= switchOnce(userId, method, deps).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function switchOnce(
  userId: string,
  method: SignInMethod,
  deps: AccountSwitchDeps,
): Promise<AccountSwitchOutcome> {
  let local: LocalSession;
  let snapshot: Awaited<ReturnType<LocalSession["account"]["snapshot"]>>;
  try {
    local = await deps.loadLocal();
    snapshot = await local.account.snapshot();
  } catch {
    return { kind: "failed", reason: "invalid" };
  }

  if (snapshot.identity.kind === "account") {
    writePendingSwitch(null);
    if (snapshot.identity.userId === userId) return { kind: "already-account" };
    await deps.signOut();
    return { kind: "other-account" };
  }

  const plan = planAccountSwitch({
    method,
    settings: snapshot.settings,
    lessonResultCount: snapshot.lessonResults.length,
  });

  if (plan === "adopt") {
    try {
      await local.account.switchToAccount(userId, { mode: "reset" });
    } catch {
      return { kind: "failed", reason: "invalid" };
    }
    writePendingSwitch(null);
    await deps.refresh();
    await deps.afterSwitch().catch(() => undefined);
    return { kind: "adopted" };
  }

  // Written first, so a closed tab mid-upload is retried with the same rules.
  writePendingSwitch({ userId, method });
  deps.store.setState({ phase: "saving" });
  try {
    await deps.migrate(buildGuestMigrationPayload(snapshot));
  } catch (error) {
    writePendingSwitch({ userId, method });
    deps.store.setState({ phase: "failed" });
    return { kind: "failed", reason: error instanceof MigrationError ? error.reason : "invalid" };
  }
  try {
    await local.account.switchToAccount(userId, {
      mode: "keep",
      migratedQueueIds: snapshot.queueIds,
    });
  } catch {
    // The server has the data; the next start retries (the RPC is idempotent).
    writePendingSwitch({ userId, method });
    deps.store.setState({ phase: "failed" });
    return { kind: "failed", reason: "invalid" };
  }
  writePendingSwitch(null);
  await deps.refresh();
  await deps.afterSwitch().catch(() => undefined);
  deps.store.setState({ phase: "saved" });
  return { kind: "saved" };
}

/** Tests only. */
export function resetAccountSwitchForTests(): void {
  inFlight = null;
  accountSwitchStore.setState({ phase: "idle" });
}

export type { Session };
