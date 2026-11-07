"use client";

import { useCallback, useEffect, useState } from "react";

/** State of an async read; `loading` until the current loader settles. */
export type AsyncState<T> =
  { status: "loading" } | { status: "success"; data: T } | { status: "error"; error: Error };

export type AsyncResource<T> = AsyncState<T> & {
  /** Runs the loader again (e.g. the "Try again" button). */
  retry: () => void;
};

interface Settled<T> {
  load: () => Promise<T>;
  attempt: number;
  value: AsyncState<T>;
}

/**
 * Minimal async read hook used until TanStack Query is installed (ARCHITECTURE §5,
 * temporary deviation). `load` must be memoised by the caller; a new `load` reloads.
 */
export function useAsyncResource<T>(load: () => Promise<T>): AsyncResource<T> {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  useEffect(() => {
    let active = true;
    load().then(
      (data) => {
        if (active) setSettled({ load, attempt, value: { status: "success", data } });
      },
      (error: unknown) => {
        if (active) {
          const err = error instanceof Error ? error : new Error(String(error));
          setSettled({ load, attempt, value: { status: "error", error: err } });
        }
      },
    );
    return () => {
      active = false;
    };
  }, [load, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const current =
    settled && settled.load === load && settled.attempt === attempt
      ? settled.value
      : ({ status: "loading" } as const);
  return { ...current, retry };
}
