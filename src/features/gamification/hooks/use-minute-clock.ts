"use client";

import { useCallback, useEffect, useState } from "react";
import { useOnPageVisible } from "./use-visible-now";

export const MINUTE_CLOCK_INTERVAL_MS = 60_000;

/**
 * The current time, refreshed once per minute while `enabled` (and when the page becomes
 * visible again). For countdown text such as `formatHeartRefill` in dialogs and the
 * out-of-hearts screen. While disabled it returns the time of the last refresh and arms
 * no timer.
 */
export function useMinuteClock(enabled = true): Date {
  const [now, setNow] = useState(() => new Date());
  const refresh = useCallback(() => setNow(new Date()), []);

  // Turning the clock on (e.g. a dialog opens) must not show a time from long ago.
  const [wasEnabled, setWasEnabled] = useState(enabled);
  if (enabled !== wasEnabled) {
    setWasEnabled(enabled);
    if (enabled) setNow(new Date());
  }

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(refresh, MINUTE_CLOCK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled, refresh]);

  useOnPageVisible(refresh, enabled);
  return now;
}
