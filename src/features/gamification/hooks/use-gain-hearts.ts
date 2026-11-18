"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GAME_CONFIG } from "@/contracts";
import { gainHearts } from "../rules/hearts";
import { writeHearts } from "./hearts-write-queue";

/**
 * Adds `amount` hearts (default `GAME_CONFIG.heartsGainedPerCorrectAnswer`, 1), capped at
 * `maxHearts`. Resolves once saved, or once a failed save was logged: it never rejects
 * for a save error.
 */
export type GainHeartsFn = (amount?: number) => Promise<void>;

/**
 * Returns `gainHearts(amount?)` (GAM-011 AC12, ADR-013, PD-065), the mirror of
 * `useLoseHearts`. The lesson player calls it on each correct non-speak Check with
 * `heartCost === 0` (LES-020).
 *
 * - The `["hearts"]` cache is updated synchronously, so `useHearts()` and the top bar
 *   show the heart at once; then the result is saved with `saveHearts` on the hearts
 *   write queue shared with `useLoseHearts` (saves land in call order). Works for guests
 *   and offline: it only touches the on-device store.
 * - `amount` 0, or hearts already full, changes nothing that matters (the rule returns
 *   the state as is; the save is skipped for 0).
 * - A negative or fractional `amount` rejects with a `RangeError` and changes nothing.
 * - A failed save is logged with `console.warn`; the cache keeps the gain for the session
 *   and the promise resolves (a missed heart must never break a lesson).
 */
export function useGainHearts(): GainHeartsFn {
  const client = useQueryClient();
  return useCallback(
    (amount: number = GAME_CONFIG.heartsGainedPerCorrectAnswer) => {
      if (!Number.isInteger(amount) || amount < 0) {
        return Promise.reject(
          new RangeError(`Heart gain must be a non-negative integer, got ${amount}`),
        );
      }
      if (amount === 0) return Promise.resolve();
      return writeHearts(client, (state, now) => gainHearts(state, amount, now), "gain").catch(
        (error: unknown) => {
          console.warn("[hearts] could not save an earned heart", error);
        },
      );
    },
    [client],
  );
}
