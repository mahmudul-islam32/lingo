/** Test helpers: each test gets its own fake IndexedDB, a fixed clock and seeded ids. */
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { vi } from "vitest";
import type { LessonResult } from "@/contracts";
import { openLocalSession, type OpenLocalSessionOptions } from "../session";
import { PolyglowDatabase } from "../db";

export const NOW = new Date("2026-11-07T10:00:00.000Z");

/** Deterministic valid v4 UUIDs. */
export function seededIds(prefix = "a") {
  let n = 0;
  return () => {
    n += 1;
    const tail = n.toString(16).padStart(12, "0");
    return `${prefix.repeat(8)}-0000-4000-8000-${tail}`;
  };
}

export interface TestDevice {
  factory: IDBFactory;
  open(overrides?: Partial<OpenLocalSessionOptions>): ReturnType<typeof openLocalSession>;
  /** Raw Dexie handle for writing corrupt data, bypassing the repositories. */
  raw(): PolyglowDatabase;
  report: ReturnType<typeof vi.fn>;
}

/** A simulated browser profile: sessions opened on it share the same IndexedDB. */
export function createDevice(): TestDevice {
  const factory = new IDBFactory();
  const report = vi.fn();
  const newId = seededIds();
  return {
    factory,
    report,
    open: (overrides = {}) =>
      openLocalSession({
        indexedDB: factory,
        IDBKeyRange,
        now: () => NOW,
        newId,
        onCorruptRecord: report,
        ...overrides,
      }),
    raw: () => new PolyglowDatabase(undefined, { indexedDB: factory, IDBKeyRange }),
  };
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function lessonResult(overrides: Partial<LessonResult> = {}): LessonResult {
  return {
    id: "3f1c2b8e-4d5a-4c6b-9e7f-1a2b3c4d5e6f",
    courseId: "spanish-from-english",
    unitId: "unit-1",
    lessonId: "greetings-1",
    startedAt: "2026-11-07T10:00:00.000Z",
    completedAt: "2026-11-07T10:04:30.000Z",
    durationMs: 270_000,
    exerciseCount: 5,
    firstTryCorrectCount: 3,
    mistakeCount: 1,
    skippedCount: 1,
    accuracy: 0.75,
    perfect: false,
    xp: { base: 10, perfectBonus: 0 },
    xpEarned: 10,
    heartsLost: 1,
    localDate: "2026-11-07",
    timeZone: "Europe/Berlin",
    ...overrides,
  };
}
