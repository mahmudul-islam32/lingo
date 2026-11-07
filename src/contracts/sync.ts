/**
 * Offline queue and sync contracts (Dexie `syncQueue` table, `src/lib/sync`).
 * Conflict rules (ARCHITECTURE §Offline & sync):
 *   - lesson_result: append-only, idempotent by `LessonResult.id` (grow-only set union)
 *   - settings / profile / hearts: last-write-wins by `updatedAt`
 */
import { z } from "zod";
import { IsoDateTimeSchema, NonNegativeIntSchema, UuidSchema } from "./common";
import { CONTRACTS_VERSION } from "./config";
import { HeartsStateSchema } from "./gamification";
import { LessonResultSchema } from "./lesson-session";
import { ProfileSchema, ProfileUpdateSchema, SettingsSchema } from "./user";

export const SyncRecordStatusSchema = z.enum([
  /** Waiting to be sent (or retrying after a transient error). */
  "pending",
  /** Permanently refused by the server (validation/RLS); kept for diagnostics, never retried. */
  "rejected",
]);
export type SyncRecordStatus = z.infer<typeof SyncRecordStatusSchema>;

const syncRecordBase = {
  /** Queue record id; for lesson results it equals the result id. */
  id: UuidSchema,
  schemaVersion: z.literal(CONTRACTS_VERSION),
  status: SyncRecordStatusSchema,
  createdAt: IsoDateTimeSchema,
  attemptCount: NonNegativeIntSchema,
  /** Earliest time of the next attempt (exponential backoff, `SYNC_CONFIG`). */
  nextAttemptAt: IsoDateTimeSchema,
  lastError: z.string().max(500).nullable(),
};

export const SyncQueueRecordSchema = z.discriminatedUnion("kind", [
  z.object({ ...syncRecordBase, kind: z.literal("lesson_result"), payload: LessonResultSchema }),
  z.object({ ...syncRecordBase, kind: z.literal("settings"), payload: SettingsSchema }),
  z.object({ ...syncRecordBase, kind: z.literal("profile"), payload: ProfileUpdateSchema }),
  z.object({ ...syncRecordBase, kind: z.literal("hearts"), payload: HeartsStateSchema }),
]);
export type SyncQueueRecord = z.infer<typeof SyncQueueRecordSchema>;
export type SyncRecordKind = SyncQueueRecord["kind"];

/** Sync engine status for the offline indicator (US-PLT-16). */
export const SyncStatusSchema = z.enum(["idle", "syncing", "offline", "error"]);
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

/** Per-device sync bookkeeping (Dexie `meta` table). */
export const SyncMetaSchema = z.object({
  lastPushAt: IsoDateTimeSchema.nullable(),
  lastPullAt: IsoDateTimeSchema.nullable(),
});
export type SyncMeta = z.infer<typeof SyncMetaSchema>;

/** Outcome of one push of the queue. */
export const SyncPushResultSchema = z.object({
  acceptedIds: z.array(UuidSchema),
  /** Ids already on the server (idempotent replay) count as accepted. */
  duplicateIds: z.array(UuidSchema),
  rejected: z.array(z.object({ id: UuidSchema, reason: z.string().max(500) })),
});
export type SyncPushResult = z.infer<typeof SyncPushResultSchema>;

/**
 * Everything a guest has on the device, uploaded once when they create an account
 * or log in (US-PLT-05). Server merge rules: lesson results are unioned by id;
 * for a brand-new account guest profile/settings/hearts become the account's;
 * for an existing account the newer `updatedAt` wins per record.
 */
export const GuestMigrationPayloadSchema = z.object({
  schemaVersion: z.literal(CONTRACTS_VERSION),
  guestId: UuidSchema,
  profile: ProfileSchema,
  settings: SettingsSchema,
  hearts: HeartsStateSchema,
  lessonResults: z.array(LessonResultSchema),
});
export type GuestMigrationPayload = z.infer<typeof GuestMigrationPayloadSchema>;
