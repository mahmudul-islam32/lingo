import { vi } from "vitest";
import type { HeartsState } from "@/contracts";
import type { LocalSession } from "@/lib/offline";

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

export function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export const HOUR = 60 * 60 * 1000;
