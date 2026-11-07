/**
 * Dexie (IndexedDB) database for the current identity on this device
 * (ARCHITECTURE §4.1). One database, `polyglow`, one identity at a time.
 *
 * Schema versioning: `DB_SCHEMA_VERSION` is the Dexie version. To add a table or an
 * index, append a new entry to `SCHEMA_VERSIONS` with the next number (and an
 * `upgrade` function if existing rows must be rewritten). Never edit a shipped entry.
 */
import Dexie, { type DexieOptions, type Table, type Transaction } from "dexie";
import type {
  CollectionIndexes,
  CollectionTable,
  LocalStore,
  SingletonTable,
  StoreTx,
  TableName,
  TransactionMode,
} from "./store";
import { ALL_TABLES } from "./store";

export const DB_NAME = "polyglow";

interface SchemaVersion {
  version: number;
  stores: Record<TableName, string>;
  upgrade?: (tx: Transaction) => Promise<void>;
}

/**
 * Dexie store definitions. Singleton tables use out-of-line keys (`""`), so the
 * stored value is exactly the contract record. Collections are keyed by `id`.
 */
export const SCHEMA_VERSIONS: readonly SchemaVersion[] = [
  {
    version: 1,
    stores: {
      identity: "",
      profile: "",
      settings: "",
      hearts: "",
      meta: "",
      lessonResults: "id, courseId, lessonId, localDate",
      syncQueue: "id, kind, status, [status+nextAttemptAt]",
    },
  },
];

/** Current Dexie schema version (the highest entry of `SCHEMA_VERSIONS`). */
export const DB_SCHEMA_VERSION = SCHEMA_VERSIONS[SCHEMA_VERSIONS.length - 1]!.version;

export class PolyglowDatabase extends Dexie {
  constructor(name: string = DB_NAME, options?: DexieOptions) {
    super(name, options);
    for (const entry of SCHEMA_VERSIONS) {
      const version = this.version(entry.version).stores(entry.stores);
      if (entry.upgrade) version.upgrade(entry.upgrade);
    }
  }
}

/**
 * Operations go through the explicit `Transaction` object rather than Dexie's implicit
 * zone, so they always belong to this transaction even after native `await`s.
 */
function createDexieTx(db: Transaction): StoreTx {
  return {
    async get(table: SingletonTable, key: string) {
      return db.table(table).get(key);
    },
    async put(table: SingletonTable, key: string, value: unknown) {
      await db.table(table).put(value, key);
    },
    async delete(table: SingletonTable, key: string) {
      await db.table(table).delete(key);
    },
    async getRow(table: CollectionTable, id: string) {
      return db.table(table).get(id);
    },
    async putRow(table: CollectionTable, row: { id: string }) {
      await db.table(table).put(row);
    },
    async deleteRow(table: CollectionTable, id: string) {
      await db.table(table).delete(id);
    },
    async getAll(table: CollectionTable) {
      return db.table(table).toArray();
    },
    async getWhere<T extends CollectionTable>(
      table: T,
      index: CollectionIndexes[T],
      value: string,
    ) {
      return db.table(table).where(index).equals(value).toArray();
    },
  };
}

export class DexieLocalStore implements LocalStore {
  readonly kind = "indexeddb" as const;
  readonly persistent = true;

  constructor(readonly db: PolyglowDatabase) {}

  transaction<T>(mode: TransactionMode, fn: (tx: StoreTx) => Promise<T>): Promise<T> {
    const tables: Table[] = ALL_TABLES.map((name) => this.db.table(name));
    const scope = (trans: Transaction): Promise<T> => fn(createDexieTx(trans));
    // Cast avoids TS2589 in Dexie's overloaded `transaction` typings; behaviour is unchanged.
    const db = this.db as unknown as {
      transaction(
        mode: TransactionMode,
        tables: Table[],
        scope: (trans: Transaction) => Promise<T>,
      ): Promise<T>;
    };
    return db.transaction(mode, tables, scope);
  }

  close(): void {
    this.db.close();
  }
}

export interface OpenDexieOptions {
  name?: string;
  /** Injected in tests (fake-indexeddb). Defaults to the browser's `indexedDB`. */
  indexedDB?: IDBFactory;
  IDBKeyRange?: typeof IDBKeyRange;
}

/** Opens (and creates or upgrades) the database. Rejects if IndexedDB is unavailable. */
export async function openDexieStore(options: OpenDexieOptions = {}): Promise<DexieLocalStore> {
  const dexieOptions: DexieOptions = {};
  if (options.indexedDB) dexieOptions.indexedDB = options.indexedDB;
  if (options.IDBKeyRange) dexieOptions.IDBKeyRange = options.IDBKeyRange;
  const db = new PolyglowDatabase(options.name ?? DB_NAME, dexieOptions);
  await db.open();
  return new DexieLocalStore(db);
}
