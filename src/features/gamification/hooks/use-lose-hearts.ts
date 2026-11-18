"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { loseHearts } from "../rules/hearts";
import { writeHearts } from "./hearts-write-queue";

/** Subtracts `cost` hearts (`AnswerCheckResult.heartCost`); resolves once saved. */
export type LoseHeartsFn = (cost: number) => Promise<void>;

/**
 * Returns `loseHearts(cost)` (GAM-005 AC 4-8):
 * - `cost === 0` resolves without writing; a negative or fractional cost rejects with a
 *   `RangeError` and changes nothing.
 * - Otherwise the `["hearts"]` cache is updated synchronously (meters change at once,
 *   each call builds on the latest value so rapid calls add up), then the result is
 *   saved with `saveHearts` on an ordered queue shared with `useGainHearts`.
 * - If the save fails the cache keeps the loss for the rest of the session (no rollback)
 *   and the returned promise rejects with the error.
 * - If hearts haven't been read yet, the read runs first (inside the queue), so a loss
 *   never overwrites stored hearts with a guess.
 */
export function useLoseHearts(): LoseHeartsFn {
  const client = useQueryClient();
  return useCallback(
    (cost: number) => {
      if (!Number.isInteger(cost) || cost < 0) {
        return Promise.reject(
          new RangeError(`Heart cost must be a non-negative integer, got ${cost}`),
        );
      }
      if (cost === 0) return Promise.resolve();
      return writeHearts(client, (state, now) => loseHearts(state, cost, now), "loss");
    },
    [client],
  );
}
