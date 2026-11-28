/** Per-device sync bookkeeping in the Dexie `meta` table (`SyncMetaSchema`, key `"sync"`). */
import { SyncMetaSchema, type SyncMeta } from "@/contracts";
import { SYNC_META_KEY, type StoreTx } from "@/lib/offline";

export const EMPTY_SYNC_META: SyncMeta = { lastPushAt: null, lastPullAt: null };

export async function readSyncMeta(tx: StoreTx): Promise<SyncMeta> {
  const parsed = SyncMetaSchema.safeParse(await tx.get("meta", SYNC_META_KEY));
  return parsed.success ? parsed.data : { ...EMPTY_SYNC_META };
}

export async function writeSyncMeta(tx: StoreTx, patch: Partial<SyncMeta>): Promise<SyncMeta> {
  const next = SyncMetaSchema.parse({ ...(await readSyncMeta(tx)), ...patch });
  await tx.put("meta", SYNC_META_KEY, next);
  return next;
}
