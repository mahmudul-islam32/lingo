"use client";

import { useEffect, useState } from "react";
import type { LocalDate } from "@/contracts";
import { toLocalDate } from "../rules/local-date";
import { msUntilNextLocalDate } from "../rules/next-local-date";

export interface UseLocalTodayOptions {
  /** IANA timezone. Default: the device timezone. Tests inject one (GAM-004 AC8). */
  timeZone?: string;
}

export interface LocalToday {
  /** Device-local calendar date, `YYYY-MM-DD`. */
  today: LocalDate;
  /** The instant `today` was computed at (refreshed on the same events). */
  now: Date;
  /** The timezone used. */
  timeZone: string;
}

/** The device timezone (`Intl`), e.g. `"Europe/Berlin"`. */
export function deviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

interface State {
  today: LocalDate;
  now: Date;
  timeZone: string;
}

function read(timeZone: string): State {
  const now = new Date();
  return { today: toLocalDate(now, timeZone), now, timeZone };
}

/**
 * Today's local date, updated without a reload (GAM-003 AC8):
 * - one `setTimeout` to the first instant of the next local date (DST-safe, capped at
 *   24 h and re-armed), and
 * - on `visibilitychange` to visible (a tab left open overnight, a phone woken up).
 *
 * `now` is refreshed on the same events, so lazy rules (heart refill) are not stale.
 */
export function useLocalToday({ timeZone }: UseLocalTodayOptions = {}): LocalToday {
  const zone = timeZone ?? deviceTimeZone();
  const [state, setState] = useState<State>(() => read(zone));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const refresh = (bumpNow: boolean) =>
      setState((prev) => {
        const next = read(zone);
        if (!bumpNow && prev.timeZone === zone && prev.today === next.today) return prev;
        return next;
      });

    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(
        () => {
          refresh(true);
          arm();
        },
        msUntilNextLocalDate(new Date(), zone),
      );
    };

    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      refresh(true);
      arm();
    };

    // The zone may have changed since the first render (prop change, travel).
    refresh(false);
    arm();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [zone]);

  return { today: state.today, now: state.now, timeZone: state.timeZone };
}
