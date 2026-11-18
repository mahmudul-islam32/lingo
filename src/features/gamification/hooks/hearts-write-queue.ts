/**
 * Shared write path of the hearts mutations (`useLoseHearts`, `useGainHearts`; GAM-005,
 * GAM-011). One module-level chain, so every hearts save lands in call order, one at a
 * time, whichever hook made it (ADR-005 decision 3), and each save writes the latest
 * cached value.
 */
import type { QueryClient } from "@tanstack/react-query";
import { HeartsStateSchema, type HeartsState } from "@/contracts";
import { getLocalSession } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import { heartsQuery } from "../data/queries";
import { createFullHearts } from "../rules/hearts";

let writeChain: Promise<void> = Promise.resolve();

function enqueue(task: () => Promise<void>): Promise<void> {
  const run = writeChain.then(task);
  writeChain = run.catch(() => undefined);
  return run;
}

/** Persists the latest cached hearts (so a queued save never writes an older value). */
async function saveLatest(client: QueryClient): Promise<void> {
  const latest = client.getQueryData<HeartsState>(queryKeys.hearts());
  if (latest === undefined) return;
  const state = HeartsStateSchema.parse(latest);
  const session = await getLocalSession();
  await session.progress.saveHearts(state);
}

function apply(client: QueryClient, update: (state: HeartsState, now: Date) => HeartsState) {
  const now = new Date();
  client.setQueryData<HeartsState>(queryKeys.hearts(), (prev) =>
    update(prev ?? createFullHearts(now), now),
  );
}

/**
 * Applies `update` to the `["hearts"]` cache and saves the result on the ordered queue.
 *
 * - Cached hearts: the cache changes synchronously (meters update at once; rapid calls
 *   build on each other), an in-flight refetch is cancelled so it can't replace the
 *   optimistic value, then the save is queued.
 * - Not read yet: the read runs first, inside the queue, so a change never overwrites
 *   stored hearts with a guess (a failed read assumes full hearts and warns).
 *
 * Resolves once saved; rejects with the save error (the cache keeps the change).
 */
export function writeHearts(
  client: QueryClient,
  update: (state: HeartsState, now: Date) => HeartsState,
  label: string,
): Promise<void> {
  if (client.getQueryData(queryKeys.hearts()) !== undefined) {
    void client.cancelQueries({ queryKey: queryKeys.hearts() });
    apply(client, update);
    return enqueue(() => saveLatest(client));
  }
  return enqueue(async () => {
    await client.ensureQueryData(heartsQuery()).catch((error: unknown) => {
      console.warn(`[hearts] could not read hearts before a ${label}; assuming full`, error);
    });
    apply(client, update);
    await saveLatest(client);
  });
}
