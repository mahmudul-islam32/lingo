/**
 * When does the device-local date change next? (GAM-003 `useLocalToday`.)
 *
 * Pure: `now` and `timeZone` are inputs. Instead of building "tomorrow 00:00" (which does
 * not exist on days whose midnight is skipped by DST, and is 23 or 25 hours away around
 * DST changes), it searches for the first instant whose `toLocalDate` differs from the
 * date at `now`. That is correct for every offset, half-hour zone and DST rule.
 */
import type { LocalDate } from "@/contracts";
import { toLocalDate } from "./local-date";

const MS_PER_HOUR = 60 * 60 * 1000;
/** Longest wait a caller should arm in one timer; it re-checks after that. */
export const MAX_LOCAL_DATE_TIMER_MS = 24 * MS_PER_HOUR;
/** A calendar day is at most 25 h long (DST fall-back), plus one hour of margin. */
const SEARCH_LIMIT_HOURS = 27;

/**
 * The first instant after `now` whose local date in `timeZone` differs from the local date
 * at `now`, to the millisecond. Throws `RangeError` for an invalid instant or timezone.
 */
export function nextLocalDateChange(now: Date, timeZone: string): Date {
  const start = now.getTime();
  const today: LocalDate = toLocalDate(now, timeZone);
  const differs = (ms: number) => toLocalDate(new Date(ms), timeZone) !== today;

  // Hourly steps find an upper bound; `lo` is always still "today", `hi` never is.
  let lo = start;
  let hi = start + MS_PER_HOUR;
  for (let hour = 1; !differs(hi); hour++) {
    // Unreachable with real timezones (a day is at most 25 h); guards against a bad ICU.
    /* v8 ignore next */
    if (hour >= SEARCH_LIMIT_HOURS) throw new RangeError(`No date change in ${timeZone}`);
    lo = hi;
    hi += MS_PER_HOUR;
  }
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (differs(mid)) hi = mid;
    else lo = mid;
  }
  return new Date(hi);
}

/**
 * Delay for one timer until the local date changes, capped at `MAX_LOCAL_DATE_TIMER_MS`
 * (the caller re-checks when a capped timer fires). Always at least 1 ms.
 */
export function msUntilNextLocalDate(now: Date, timeZone: string): number {
  const delay = nextLocalDateChange(now, timeZone).getTime() - now.getTime();
  return Math.max(1, Math.min(MAX_LOCAL_DATE_TIMER_MS, delay));
}
