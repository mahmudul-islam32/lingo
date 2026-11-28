/**
 * "The sync queue changed" events (PLT-014 criterion 2: push 2 s after the last enqueue).
 * The local store is wrapped so every committed transaction that wrote a queue record
 * notifies the listeners once, after the commit. In-tab only; other tabs hear about synced
 * data through the sync engine's `BroadcastChannel`.
 */
import type { LocalStore, StoreTx } from "./store";

type Listener = () => void;
const listeners = new Set<Listener>();

export function onSyncQueueChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // A listener must never break a write.
    }
  }
}

/** Wraps `store` so queue inserts / updates notify after their transaction committed. */
export function withQueueEvents(store: LocalStore): LocalStore {
  return {
    kind: store.kind,
    persistent: store.persistent,
    close: () => store.close(),
    transaction: async <T>(mode: "r" | "rw", fn: (tx: StoreTx) => Promise<T>) => {
      let touched = false;
      const result = await store.transaction(mode, (tx) =>
        fn({
          ...tx,
          putRow: async (table, row) => {
            if (table === "syncQueue") touched = true;
            await tx.putRow(table, row);
          },
        }),
      );
      if (touched) notify();
      return result;
    },
  };
}
