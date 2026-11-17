"use client";

import { useEffect } from "react";

/**
 * Last `errorUpdatedAt` warned about per error object (FIX-003, FIX-006). `useHearts` and
 * every `useProgressInputs` caller (top bar, streak, ring, path, lesson player) observe
 * the same failed `["hearts"]` read, so sharing this guard keeps it to exactly one
 * warning per failed read across all of them, instead of one per hook or render.
 * A refetch that fails again has a new `errorUpdatedAt`, so it warns once more.
 */
const warnedHeartsReads = new WeakMap<Error, number>();

export const HEARTS_READ_WARNING = "[hearts] could not read hearts; counting full hearts";

/** Logs `HEARTS_READ_WARNING` once per failed `["hearts"]` read. */
export function useWarnOnHeartsReadError(error: Error | null, errorUpdatedAt: number): void {
  useEffect(() => {
    if (!error || warnedHeartsReads.get(error) === errorUpdatedAt) return;
    warnedHeartsReads.set(error, errorUpdatedAt);
    console.warn(HEARTS_READ_WARNING, error);
  }, [error, errorUpdatedAt]);
}
