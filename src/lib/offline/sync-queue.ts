/**
 * Sync queue records (Dexie `syncQueue`, ARCHITECTURE §4.3). This module only stores
 * records; draining them to Supabase is the SyncEngine's job (src/lib/sync, later).
 */
import {
  CONTRACTS_VERSION,
  SyncQueueRecordSchema,
  type SyncQueueRecord,
  type SyncRecordKind,
} from "@/contracts";
import { InvalidRecordError } from "./errors";
import type { LocalStore, StoreTx } from "./store";
import { formatIssues, readRecord, type CorruptRecordReporter } from "./validation";

type RecordOfKind<K extends SyncRecordKind> = Extract<SyncQueueRecord, { kind: K }>;

/** What a repository enqueues; the queue fills in status, attempts and timestamps. */
export type SyncRecordInput = {
  [K in SyncRecordKind]: { kind: K; payload: RecordOfKind<K>["payload"]; id?: string };
}[SyncRecordKind];

export function buildSyncRecord(
  input: SyncRecordInput,
  now: Date,
  newId: () => string,
): SyncQueueRecord {
  const iso = now.toISOString();
  const candidate = {
    id: input.id ?? newId(),
    schemaVersion: CONTRACTS_VERSION,
    status: "pending",
    createdAt: iso,
    attemptCount: 0,
    nextAttemptAt: iso,
    lastError: null,
    kind: input.kind,
    payload: input.payload,
  };
  const parsed = SyncQueueRecordSchema.safeParse(candidate);
  if (!parsed.success) throw new InvalidRecordError("invalid_record", formatIssues(parsed.error));
  return parsed.data;
}

/**
 * Adds a record inside an open transaction. Settings, profile and hearts are
 * last-write-wins, so older pending records of the same kind are dropped first
 * (only the latest is ever sent). Lesson results are never coalesced.
 */
export async function enqueueInTx(tx: StoreTx, record: SyncQueueRecord): Promise<void> {
  if (record.kind !== "lesson_result") {
    const sameKind = await tx.getWhere("syncQueue", "kind", record.kind);
    for (const row of sameKind) {
      const parsed = SyncQueueRecordSchema.safeParse(row);
      const id = parsed.success ? parsed.data.id : idOf(row);
      const pending = parsed.success ? parsed.data.status === "pending" : true;
      if (id && pending) await tx.deleteRow("syncQueue", id);
    }
  }
  await tx.putRow("syncQueue", record);
}

function idOf(row: unknown): string | null {
  if (typeof row === "object" && row !== null && "id" in row) {
    const id = (row as { id: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}

export interface SyncQueueStore {
  /** All valid records, oldest first. Corrupt rows are skipped and reported. */
  list(): Promise<SyncQueueRecord[]>;
  /** Pending records whose `nextAttemptAt` is at or before `now`, oldest first. */
  listDue(now: Date): Promise<SyncQueueRecord[]>;
  get(id: string): Promise<SyncQueueRecord | null>;
  /** Replaces a record (e.g. after a failed attempt). Validated before it is stored. */
  update(record: SyncQueueRecord): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createSyncQueueStore(
  store: LocalStore,
  report: CorruptRecordReporter,
): SyncQueueStore {
  const readAll = async (tx: StoreTx): Promise<SyncQueueRecord[]> => {
    const rows = await tx.getAll("syncQueue");
    const records: SyncQueueRecord[] = [];
    for (const row of rows) {
      const read = readRecord(SyncQueueRecordSchema, row);
      if (read.status === "ok") records.push(read.value);
      else if (read.status === "corrupt") {
        report({
          table: "syncQueue",
          key: idOf(row) ?? "?",
          action: "skipped",
          issues: read.issues,
        });
      }
    }
    return records.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  };

  return {
    list: () => store.transaction("r", readAll),
    listDue: (now) =>
      store.transaction("r", async (tx) =>
        (await readAll(tx)).filter(
          (r) => r.status === "pending" && Date.parse(r.nextAttemptAt) <= now.getTime(),
        ),
      ),
    get: (id) =>
      store.transaction("r", async (tx) => {
        const read = readRecord(SyncQueueRecordSchema, await tx.getRow("syncQueue", id));
        if (read.status === "corrupt") {
          report({ table: "syncQueue", key: id, action: "skipped", issues: read.issues });
        }
        return read.status === "ok" ? read.value : null;
      }),
    update: async (record) => {
      const parsed = SyncQueueRecordSchema.safeParse(record);
      if (!parsed.success) {
        throw new InvalidRecordError("invalid_record", formatIssues(parsed.error));
      }
      await store.transaction("rw", (tx) => tx.putRow("syncQueue", parsed.data));
    },
    remove: (id) => store.transaction("rw", (tx) => tx.deleteRow("syncQueue", id)),
  };
}
