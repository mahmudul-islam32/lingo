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

/**
 * Lesson-result pull cursor: the last `(created_at, id)` seen. Composite because one guest
 * migration inserts up to 10,000 results with the same `created_at`, more than one page
 * (`max_rows` 1000), so a timestamp alone would loop or skip rows (ADR-020 §6).
 */
export const LessonResultCursorSchema = z.object({
  createdAt: IsoDateTimeSchema,
  id: UuidSchema,
});
export type LessonResultCursor = z.infer<typeof LessonResultCursorSchema>;

/**
 * Pull cursors (CTO-025, ADR-020 §6): the last **server** value seen per table, never a
 * client clock. `lessonResults` pages by `(created_at, id)` (append-only); the one-row
 * tables by `server_updated_at`. `null` = pull everything.
 */
export const SyncPullCursorsSchema = z.object({
  lessonResults: LessonResultCursorSchema.nullable(),
  profile: IsoDateTimeSchema.nullable(),
  settings: IsoDateTimeSchema.nullable(),
  hearts: IsoDateTimeSchema.nullable(),
});
export type SyncPullCursors = z.infer<typeof SyncPullCursorsSchema>;

/** Per-device sync bookkeeping (Dexie `meta` table). */
export const SyncMetaSchema = z.object({
  lastPushAt: IsoDateTimeSchema.nullable(),
  lastPullAt: IsoDateTimeSchema.nullable(),
  /** Missing until the first pull (records stored before CTO-025 stay valid). */
  pullCursors: SyncPullCursorsSchema.optional(),
});
export type SyncMeta = z.infer<typeof SyncMetaSchema>;

/**
 * One pull round (CTO-025, ADR-020 §6). `lessonResults` holds at most one page (the server
 * caps rows at `max_rows`, 1000); `hasMore` says to pull again with the returned cursors.
 * The one-row facts are `null` when unchanged since the cursor. Every row is parsed with
 * the contract schema before it is merged; a row that fails is skipped and logged.
 */
export const SyncPullResultSchema = z.object({
  lessonResults: z.array(LessonResultSchema),
  profile: ProfileSchema.nullable(),
  settings: SettingsSchema.nullable(),
  hearts: HeartsStateSchema.nullable(),
  cursors: SyncPullCursorsSchema,
  hasMore: z.boolean(),
});
export type SyncPullResult = z.infer<typeof SyncPullResultSchema>;

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
 * for an existing account the newer `updatedAt` wins per record, except that settings
 * are merged (CTO-025, ADR-020 §8): `goalPlans` are united by course id (the newer record
 * wins a shared course) and `startLevel` is never dropped; a legacy `goalPlan` counts for
 * its record's `courseId`.
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
