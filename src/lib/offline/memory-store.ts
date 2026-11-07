/**
 * In-memory `LocalStore`: the fallback when IndexedDB can't be opened (for example in
 * some private browsing modes). Data lives for the current tab session only.
 * Transactions run one at a time and roll back on error, like IndexedDB.
 */
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

type Tables = Map<TableName, Map<string, unknown>>;

function emptyTables(): Tables {
  return new Map(ALL_TABLES.map((name) => [name, new Map<string, unknown>()]));
}

/** Copies values in and out, so callers can't mutate stored records (IndexedDB semantics). */
function clone<T>(value: T): T {
  return value === undefined ? value : structuredClone(value);
}

export class MemoryLocalStore implements LocalStore {
  readonly kind = "memory" as const;
  readonly persistent = false;

  private tables: Tables = emptyTables();
  private tail: Promise<unknown> = Promise.resolve();

  transaction<T>(mode: TransactionMode, fn: (tx: StoreTx) => Promise<T>): Promise<T> {
    const run = async (): Promise<T> => {
      const snapshot = mode === "rw" ? this.snapshot() : null;
      try {
        return await fn(this.createTx(mode));
      } catch (error) {
        if (snapshot) this.tables = snapshot;
        throw error;
      }
    };
    const result = this.tail.then(run, run);
    this.tail = result.catch(() => undefined);
    return result;
  }

  close(): void {
    this.tables = emptyTables();
  }

  private snapshot(): Tables {
    const copy: Tables = new Map();
    for (const [name, rows] of this.tables) copy.set(name, new Map(rows));
    return copy;
  }

  private table(name: TableName): Map<string, unknown> {
    const rows = this.tables.get(name);
    if (!rows) throw new Error(`Unknown table: ${name}`);
    return rows;
  }

  private createTx(mode: TransactionMode): StoreTx {
    const assertWritable = () => {
      if (mode !== "rw") throw new Error("ReadOnlyError: write in a read-only transaction");
    };
    return {
      get: async (table: SingletonTable, key: string) => clone(this.table(table).get(key)),
      put: async (table: SingletonTable, key: string, value: unknown) => {
        assertWritable();
        this.table(table).set(key, clone(value));
      },
      delete: async (table: SingletonTable, key: string) => {
        assertWritable();
        this.table(table).delete(key);
      },
      getRow: async (table: CollectionTable, id: string) => clone(this.table(table).get(id)),
      putRow: async (table: CollectionTable, row: { id: string }) => {
        assertWritable();
        this.table(table).set(row.id, clone(row));
      },
      deleteRow: async (table: CollectionTable, id: string) => {
        assertWritable();
        this.table(table).delete(id);
      },
      getAll: async (table: CollectionTable) => [...this.table(table).values()].map(clone),
      getWhere: async <T extends CollectionTable>(
        table: T,
        index: CollectionIndexes[T],
        value: string,
      ) =>
        [...this.table(table).values()]
          .filter(
            (row) =>
              typeof row === "object" &&
              row !== null &&
              (row as Record<string, unknown>)[index] === value,
          )
          .map(clone),
    };
  }
}
