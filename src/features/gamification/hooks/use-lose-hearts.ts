"use client";

import { useCallback } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { HeartsStateSchema, type HeartsState } from "@/contracts";
import { getLocalSession } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import { heartsQuery } from "../data/queries";
import { createFullHearts, loseHearts } from "../rules/hearts";

/** Subtracts `cost` hearts (`AnswerCheckResult.heartCost`); resolves once saved. */
export type LoseHeartsFn = (cost: number) => Promise<void>;

/**
 * Module-level write chain: saves land in call order, one at a time, across every
 * component that calls `useLoseHearts` (ADR-005 decision 3).
 */
let writeChain: Promise<void> = Promise.resolve();

function enqueue(task: () => Promise<void>): Promise<void> {
  const run = writeChain.then(task);
  writeChain = run.catch(() => undefined);
  return run;
}

function applyLoss(client: QueryClient, cost: number): void {
  const now = new Date();
  client.setQueryData<HeartsState>(queryKeys.hearts(), (prev) =>
    loseHearts(prev ?? createFullHearts(now), cost, now),
  );
}

/** Persists the latest cached hearts (so a queued save never writes an older value). */
async function saveLatest(client: QueryClient): Promise<void> {
  const latest = client.getQueryData<HeartsState>(queryKeys.hearts());
  if (latest === undefined) return;
  const state = HeartsStateSchema.parse(latest);
  const session = await getLocalSession();
  await session.progress.saveHearts(state);
}

/**
 * Returns `loseHearts(cost)` (GAM-005 AC 4-8):
 * - `cost === 0` resolves without writing; a negative or fractional cost rejects with a
 *   `RangeError` and changes nothing.
 * - Otherwise the `["hearts"]` cache is updated synchronously (meters change at once,
 *   each call builds on the latest value so rapid calls add up), then the result is
 *   saved with `saveHearts` on an ordered queue.
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

      if (client.getQueryData(queryKeys.hearts()) !== undefined) {
        // Stop an in-flight refetch from replacing the optimistic value.
        void client.cancelQueries({ queryKey: queryKeys.hearts() });
        applyLoss(client, cost);
        return enqueue(() => saveLatest(client));
      }
      return enqueue(async () => {
        await client.ensureQueryData(heartsQuery()).catch((error: unknown) => {
          console.warn("[hearts] could not read hearts before a loss; assuming full", error);
        });
        applyLoss(client, cost);
        await saveLatest(client);
      });
    },
    [client],
  );
}
