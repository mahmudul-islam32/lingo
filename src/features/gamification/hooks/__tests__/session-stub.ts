/**
 * Test stubs for `getLocalSession()` from `@/lib/offline`: only the methods the gamification
 * hooks use. Tests `vi.mock("@/lib/offline", ...)` and return one of these sessions.
 * - `createStubSession`: progress reads (results, hearts, settings), GAM-003.
 * - `createHeartsSessionStub`: hearts read and write, GAM-005.
 */
import { vi } from "vitest";
import type { HeartsState, LessonResult, Settings } from "@/contracts";
import type { LocalSession } from "@/lib/offline";

export interface StubSession {
  progress: {
    listLessonResults: ReturnType<typeof vi.fn<(courseId: string) => Promise<LessonResult[]>>>;
    getHearts: ReturnType<typeof vi.fn<() => Promise<HeartsState>>>;
  };
  profile: {
    findSettings: ReturnType<typeof vi.fn<() => Promise<Settings | null>>>;
  };
}

export function createStubSession(): StubSession {
  return {
    progress: { listLessonResults: vi.fn(), getHearts: vi.fn() },
    profile: { findSettings: vi.fn() },
  };
}

/** A minimal `LocalSession` whose hearts methods are `vi.fn()`s. */
export function createHeartsSessionStub(initial?: HeartsState) {
  const getHearts = vi.fn<() => Promise<HeartsState>>(async () => {
    if (!initial) throw new Error("no hearts stubbed");
    return initial;
  });
  const saveHearts = vi.fn<(state: HeartsState) => Promise<void>>(async () => undefined);
  const session = { progress: { getHearts, saveHearts } } as unknown as LocalSession;
  return { session, getHearts, saveHearts };
}

/** Promise that never settles (keeps a query in "loading"). */
export function pending<T>(): Promise<T> {
  return new Promise<T>(() => {});
}

export function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Stubs `document.visibilityState` and dispatches `visibilitychange`. */
export function becomeVisible(state: DocumentVisibilityState = "visible") {
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => state });
  document.dispatchEvent(new Event("visibilitychange"));
}

export const HOUR = 60 * 60 * 1000;
