/**
 * Opens local storage for this device and wires up the repositories.
 * Falls back to in-memory storage when IndexedDB can't be opened or written
 * (some private browsing modes); `storage.persistent` tells the UI to show the
 * "can't save" notice.
 */
import { openDexieStore, type OpenDexieOptions } from "./db";
import { newUuid, systemClock } from "./ids";
import { MemoryLocalStore } from "./memory-store";
import {
  createLocalProfileRepository,
  createLocalProgressRepository,
  type LocalProfileRepository,
  type LocalProgressRepository,
  type RepositoryDeps,
} from "./repositories";
import { notifyProgressChanged } from "./progress-events";
import type { LocalStore, StorageKind } from "./store";
import { createSyncQueueStore, type SyncQueueStore } from "./sync-queue";
import { warnCorruptRecord, type CorruptRecordReporter } from "./validation";

export interface StorageInfo {
  kind: StorageKind;
  /** False when data is kept in memory only and will be lost when the tab closes. */
  persistent: boolean;
  /** Why IndexedDB wasn't used, for logs. `null` when it is in use. */
  fallbackReason: string | null;
}

export interface LocalSession {
  storage: StorageInfo;
  profile: LocalProfileRepository;
  progress: LocalProgressRepository;
  syncQueue: SyncQueueStore;
  close(): void;
}

export interface OpenLocalSessionOptions extends OpenDexieOptions {
  now?: () => Date;
  newId?: () => string;
  onCorruptRecord?: CorruptRecordReporter;
  /** Skip IndexedDB entirely (tests, or a future "don't store" setting). */
  forceMemory?: boolean;
}

function wire(
  store: LocalStore,
  deps: RepositoryDeps,
  fallbackReason: string | null,
): LocalSession {
  return {
    storage: { kind: store.kind, persistent: store.persistent, fallbackReason },
    profile: createLocalProfileRepository(store, deps),
    progress: withProgressNotifications(createLocalProgressRepository(store, deps)),
    syncQueue: createSyncQueueStore(store, deps.report),
    close: () => store.close(),
  };
}

/** Announces each successful result save, so readers of `listLessonResults` refresh. */
function withProgressNotifications(repository: LocalProgressRepository): LocalProgressRepository {
  return {
    ...repository,
    saveLessonResult: async (result) => {
      await repository.saveLessonResult(result);
      notifyProgressChanged(result.courseId);
    },
  };
}

function describe(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

export async function openLocalSession(
  options: OpenLocalSessionOptions = {},
): Promise<LocalSession> {
  const deps: RepositoryDeps = {
    now: options.now ?? systemClock,
    newId: options.newId ?? newUuid,
    report: options.onCorruptRecord ?? warnCorruptRecord,
  };

  let fallbackReason = "IndexedDB disabled for this session";
  if (!options.forceMemory) {
    let store: LocalStore | null = null;
    try {
      store = await openDexieStore(options);
      const session = wire(store, deps, null);
      // Probe with the real first-launch write: some browsers open IndexedDB but refuse writes.
      await session.profile.bootstrap();
      return session;
    } catch (error) {
      store?.close();
      fallbackReason = describe(error);
    }
  }
  return wire(new MemoryLocalStore(), deps, fallbackReason);
}

let shared: Promise<LocalSession> | null = null;

/** The app-wide session (browser only). Opened once, on first use. */
export function getLocalSession(): Promise<LocalSession> {
  shared ??= openLocalSession();
  return shared;
}

/** Test helper: forget the shared session so the next call opens a new one. */
export function resetLocalSession(): void {
  void shared?.then((s) => s.close());
  shared = null;
}
