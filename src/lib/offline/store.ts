/**
 * Storage port used by the repositories. Two implementations exist:
 * - `DexieLocalStore` (IndexedDB, persistent), see `db.ts`;
 * - `MemoryLocalStore` (session only), the fallback when IndexedDB can't be opened.
 *
 * Values are `unknown` on purpose: everything read back is parsed with the zod
 * contracts by the repositories, never trusted.
 */

/** Tables holding one record under a fixed key (`"current"` or `"sync"`). */
export type SingletonTable = "identity" | "profile" | "settings" | "hearts" | "meta";
/** Tables holding many records keyed by their own `id`. */
export type CollectionTable = "lessonResults" | "syncQueue";
export type TableName = SingletonTable | CollectionTable;

export const SINGLETON_TABLES: readonly SingletonTable[] = [
  "identity",
  "profile",
  "settings",
  "hearts",
  "meta",
];
export const COLLECTION_TABLES: readonly CollectionTable[] = ["lessonResults", "syncQueue"];
export const ALL_TABLES: readonly TableName[] = [...SINGLETON_TABLES, ...COLLECTION_TABLES];

/** Key of the single record in a singleton table. */
export const CURRENT_KEY = "current";
/** Key of the sync bookkeeping record in `meta`. */
export const SYNC_META_KEY = "sync";

/** Indexed fields that `getWhere` may query, per collection table. */
export interface CollectionIndexes {
  lessonResults: "courseId" | "lessonId" | "localDate";
  syncQueue: "kind" | "status";
}

export type TransactionMode = "r" | "rw";

/** Operations available inside one transaction. Only await these inside `transaction`. */
export interface StoreTx {
  get(table: SingletonTable, key: string): Promise<unknown>;
  put(table: SingletonTable, key: string, value: unknown): Promise<void>;
  delete(table: SingletonTable, key: string): Promise<void>;
  getRow(table: CollectionTable, id: string): Promise<unknown>;
  /** Insert or replace a row; the row's `id` field is its key. */
  putRow(table: CollectionTable, row: { id: string }): Promise<void>;
  deleteRow(table: CollectionTable, id: string): Promise<void>;
  getAll(table: CollectionTable): Promise<unknown[]>;
  getWhere<T extends CollectionTable>(
    table: T,
    index: CollectionIndexes[T],
    value: string,
  ): Promise<unknown[]>;
}

export type StorageKind = "indexeddb" | "memory";

export interface LocalStore {
  readonly kind: StorageKind;
  /** True when data survives a reload (IndexedDB). False for the in-memory fallback. */
  readonly persistent: boolean;
  /**
   * Runs `fn` atomically: either every write in it is applied or none is.
   * Do not await anything other than `tx` operations inside `fn`, and never start a
   * nested transaction.
   */
  transaction<T>(mode: TransactionMode, fn: (tx: StoreTx) => Promise<T>): Promise<T>;
  close(): void;
}
