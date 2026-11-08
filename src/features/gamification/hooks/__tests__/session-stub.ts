/**
 * Test stub for `getLocalSession()` from `@/lib/offline`: only the reads the gamification
 * hooks use. Tests `vi.mock("@/lib/offline", ...)` with `stubOffline` from here.
 */
import { vi } from "vitest";
import type { HeartsState, LessonResult, Settings } from "@/contracts";

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

/** Promise that never settles (keeps a query in "loading"). */
export function pending<T>(): Promise<T> {
  return new Promise<T>(() => {});
}

/** Stubs `document.visibilityState` and dispatches `visibilitychange`. */
export function becomeVisible(state: DocumentVisibilityState = "visible") {
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => state });
  document.dispatchEvent(new Event("visibilitychange"));
}
