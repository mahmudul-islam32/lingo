/**
 * One sync at a time per device, across tabs (ADR-020 §7): a Web Lock requested with
 * `ifAvailable` (a tab that doesn't get it skips the round), or, without Web Locks, a 30 s
 * lease in the `meta` table taken in one transaction.
 */
import type { LocalStore } from "@/lib/offline";
import { SYNC_LOCK_NAME, SYNC_TIMINGS } from "./config";

export interface SyncLock {
  /** Runs `fn` when the lock is free; `{ ran: false }` when another engine holds it. */
  run<T>(fn: () => Promise<T>): Promise<{ ran: true; value: T } | { ran: false }>;
}

interface LockManagerLike {
  request<T>(
    name: string,
    options: { ifAvailable: boolean },
    callback: (lock: unknown) => Promise<T>,
  ): Promise<T>;
}

export function webLock(locks: LockManagerLike, name = SYNC_LOCK_NAME): SyncLock {
  return {
    async run<T>(fn: () => Promise<T>) {
      let ran = false;
      let value: T | undefined;
      await locks.request(name, { ifAvailable: true }, async (lock) => {
        if (!lock) return;
        ran = true;
        value = await fn();
      });
      return ran ? { ran: true as const, value: value as T } : { ran: false as const };
    },
  };
}

const LEASE_KEY = "sync-lease";

interface Lease {
  owner: string;
  until: number;
}

export function leaseLock(
  store: LocalStore,
  owner: string,
  now: () => Date,
  leaseMs: number = SYNC_TIMINGS.lockLeaseMs,
): SyncLock {
  return {
    async run<T>(fn: () => Promise<T>) {
      const got = await store.transaction("rw", async (tx) => {
        const lease = (await tx.get("meta", LEASE_KEY)) as Lease | undefined;
        const t = now().getTime();
        if (lease && lease.owner !== owner && lease.until > t) return false;
        await tx.put("meta", LEASE_KEY, { owner, until: t + leaseMs } satisfies Lease);
        return true;
      });
      if (!got) return { ran: false as const };
      try {
        return { ran: true as const, value: await fn() };
      } finally {
        await store.transaction("rw", async (tx) => {
          const lease = (await tx.get("meta", LEASE_KEY)) as Lease | undefined;
          if (lease?.owner === owner) await tx.delete("meta", LEASE_KEY);
        });
      }
    },
  };
}

/** Web Locks when the browser has them, else the lease. */
export function deviceLock(store: LocalStore, owner: string, now: () => Date): SyncLock {
  const locks =
    typeof navigator !== "undefined" ? (navigator as { locks?: LockManagerLike }).locks : undefined;
  return locks && typeof locks.request === "function"
    ? webLock(locks)
    : leaseLock(store, owner, now);
}
