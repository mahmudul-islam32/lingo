/**
 * Guest → account switch on this device (PLT-013, ADR-020 §8). Reads everything a guest
 * has for the `GuestMigrationPayload`, and rewrites the identity in one transaction once
 * the server has the data. No network access happens here.
 */
import {
  CONTRACTS_VERSION,
  GuestMigrationPayloadSchema,
  LessonResultSchema,
  SyncQueueRecordSchema,
  type GuestMigrationPayload,
  type HeartsState,
  type Identity,
  type LessonResult,
  type Profile,
  type Settings,
} from "@/contracts";
import { createDefaultProfile, createFullHearts } from "./defaults";
import { InvalidRecordError } from "./errors";
import { ensureIdentity, readHearts, readSettings, type RepositoryDeps } from "./repositories";
import { CURRENT_KEY, SYNC_META_KEY, type LocalStore, type StoreTx } from "./store";
import { formatIssues, readRecord } from "./validation";

/** Everything on the device at one moment, read in one transaction. */
export interface DeviceSnapshot {
  identity: Identity;
  profile: Profile;
  /** `null` before onboarding. */
  settings: Settings | null;
  hearts: HeartsState;
  /** Every valid lesson result of every course, oldest first. */
  lessonResults: LessonResult[];
  /** Ids of the queue records at that moment (they are covered by the payload). */
  queueIds: string[];
}

/**
 * `keep`: the guest's data was migrated; it stays and now belongs to the account.
 * `reset`: nothing was migrated (PD-087); profile, settings and hearts start empty so the
 * account's are pulled (PLT-015). Lesson results are never deleted.
 */
export type AccountSwitchMode = "keep" | "reset";

export interface LocalAccountStore {
  snapshot(): Promise<DeviceSnapshot>;
  /**
   * Rewrites the identity to `{ kind: "account", userId }` in one transaction, removes the
   * queue records in `migratedQueueIds` (their content is on the server) and resets the
   * pull cursors. With `reset`, also the one-row records and their queued writes.
   */
  switchToAccount(
    userId: string,
    options: { mode: AccountSwitchMode; migratedQueueIds?: readonly string[] },
  ): Promise<Identity>;
  listAllLessonResults(): Promise<LessonResult[]>;
}

async function readAllResults(tx: StoreTx, deps: RepositoryDeps): Promise<LessonResult[]> {
  const results: LessonResult[] = [];
  for (const row of await tx.getAll("lessonResults")) {
    const read = readRecord(LessonResultSchema, row);
    if (read.status === "ok") results.push(read.value);
    else if (read.status === "corrupt") {
      const key = (row as { id?: unknown }).id;
      deps.report({
        table: "lessonResults",
        key: typeof key === "string" ? key : "?",
        action: "skipped",
        issues: read.issues,
      });
    }
  }
  return results.sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt));
}

async function queueIds(tx: StoreTx): Promise<string[]> {
  const ids: string[] = [];
  for (const row of await tx.getAll("syncQueue")) {
    const id = (row as { id?: unknown }).id;
    if (typeof id === "string") ids.push(id);
  }
  return ids;
}

export function createLocalAccountStore(
  store: LocalStore,
  deps: RepositoryDeps,
): LocalAccountStore {
  return {
    snapshot: () =>
      store.transaction("rw", async (tx) => {
        const { identity, profile } = await ensureIdentity(tx, deps);
        const settings = await readSettings(tx, deps);
        const hearts = await readHearts(tx, deps);
        const lessonResults = await readAllResults(tx, deps);
        return { identity, profile, settings, hearts, lessonResults, queueIds: await queueIds(tx) };
      }),

    switchToAccount: (userId, { mode, migratedQueueIds = [] }) =>
      store.transaction("rw", async (tx) => {
        const { profile } = await ensureIdentity(tx, deps);
        const identity: Identity = { kind: "account", userId };
        await tx.put("identity", CURRENT_KEY, identity);
        for (const id of migratedQueueIds) await tx.deleteRow("syncQueue", id);
        if (mode === "keep") {
          await tx.put("profile", CURRENT_KEY, { ...profile, id: userId });
        } else {
          await tx.put("profile", CURRENT_KEY, createDefaultProfile(userId, deps.now()));
          await tx.delete("settings", CURRENT_KEY);
          await tx.put("hearts", CURRENT_KEY, createFullHearts(deps.now()));
          // The guest's own one-row writes must not overwrite the account's (PD-087).
          for (const row of await tx.getAll("syncQueue")) {
            const parsed = SyncQueueRecordSchema.safeParse(row);
            if (parsed.success && parsed.data.kind !== "lesson_result") {
              await tx.deleteRow("syncQueue", parsed.data.id);
            }
          }
        }
        await tx.delete("meta", SYNC_META_KEY);
        return identity;
      }),

    listAllLessonResults: () => store.transaction("r", (tx) => readAllResults(tx, deps)),
  };
}

/**
 * The `GuestMigrationPayload` of a guest snapshot (PLT-013 criterion 3): profile,
 * settings incl. `startLevel` and `goalPlans`, hearts and every lesson result incl. `kind`
 * and `exerciseOutcomes`, validated with the contract schema. Pure.
 */
export function buildGuestMigrationPayload(snapshot: DeviceSnapshot): GuestMigrationPayload {
  if (snapshot.identity.kind !== "guest") {
    throw new InvalidRecordError("invalid_record", ["the device's identity is not a guest"]);
  }
  if (!snapshot.settings) {
    throw new InvalidRecordError("invalid_record", ["a guest without settings is never migrated"]);
  }
  const parsed = GuestMigrationPayloadSchema.safeParse({
    schemaVersion: CONTRACTS_VERSION,
    guestId: snapshot.identity.guestId,
    profile: snapshot.profile,
    settings: snapshot.settings,
    hearts: snapshot.hearts,
    lessonResults: snapshot.lessonResults,
  });
  if (!parsed.success) throw new InvalidRecordError("invalid_record", formatIssues(parsed.error));
  return parsed.data;
}
