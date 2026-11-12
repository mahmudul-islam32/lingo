"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { HeartsView } from "@/contracts";
import { heartsQuery } from "../data/queries";
import { createFullHearts, viewHearts } from "../rules/hearts";
import { useOnPageVisible } from "./use-visible-now";

/** `setTimeout` can't wait longer than this (about 24.8 days); longer waits re-arm. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

export type UseHeartsResult =
  /** First read still running: show a meter-sized skeleton. */
  | { status: "pending"; view: null; error: null }
  | { status: "success"; view: HeartsView; error: null }
  /** Read failed: `view` is full hearts so nobody is blocked by a storage problem. */
  | { status: "error"; view: HeartsView; error: Error };

/**
 * Hearts as the UI shows them right now (GAM-005 AC 1-3). Reads the stored
 * `HeartsState` through the `["hearts"]` query and derives `viewHearts(stored, now)`.
 *
 * `now` only changes when it matters: one `setTimeout` armed for `view.nextRefillAt`
 * (re-armed after each refill) and on `visibilitychange`. No polling, so the hook
 * re-renders at most once per refill while waiting.
 */
export function useHearts(): UseHeartsResult {
  const query = useQuery(heartsQuery());
  const [now, setNow] = useState(() => new Date());
  const refresh = useCallback(() => setNow(new Date()), []);

  const stored = query.data;
  const isError = query.status === "error";
  const view = useMemo<HeartsView | null>(() => {
    if (stored !== undefined) return viewHearts(stored, now);
    if (isError) return viewHearts(createFullHearts(now), now);
    return null;
  }, [stored, isError, now]);

  const nextRefillAt = view?.nextRefillAt ?? null;
  useEffect(() => {
    if (nextRefillAt === null) return;
    const target = Date.parse(nextRefillAt);
    let id: ReturnType<typeof setTimeout> | undefined;
    const arm = () => {
      const delay = target - Date.now();
      if (delay <= 0) {
        refresh();
        return;
      }
      // Re-check on wake-up: a timer may fire early, or the wait may exceed the max.
      id = setTimeout(arm, Math.min(delay, MAX_TIMEOUT_MS));
    };
    arm();
    return () => clearTimeout(id);
  }, [nextRefillAt, refresh]);

  useOnPageVisible(refresh);

  const error = query.error;
  useEffect(() => {
    if (error) console.warn("[hearts] could not read hearts; showing full hearts", error);
  }, [error]);

  if (view === null) return { status: "pending", view: null, error: null };
  if (query.status === "error" && stored === undefined) {
    return { status: "error", view, error: query.error };
  }
  return { status: "success", view, error: null };
}
