/**
 * Hearts countdown text (GAM-005 AC 9, 10). Pure: `now` is always passed in.
 *
 * Rounding: minutes are rounded up, so the text never says "0 min" and never "60 min"
 * (59 min 1 s → "1 h").
 */
import type { HeartsView } from "@/contracts";

const MINUTE_MS = 60_000;

/**
 * "less than a minute" under 60 s (including overdue), else minutes rounded up:
 * "N min" under 1 hour, "H h M min" from 1 hour, "H h" when M is 0.
 */
export function formatRoundedDuration(ms: number): string {
  if (!(ms >= MINUTE_MS)) return "less than a minute";
  const minutes = Math.ceil(ms / MINUTE_MS);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function remainingMs(iso: string, now: Date): number {
  return Date.parse(iso) - now.getTime();
}

/** "Next heart in …", or `null` when hearts are full. */
export function formatHeartRefill(view: HeartsView, now: Date): string | null {
  if (view.nextRefillAt === null) return null;
  return `Next heart in ${formatRoundedDuration(remainingMs(view.nextRefillAt, now))}`;
}

/** "Full in …", or `null` when hearts are full. */
export function formatHeartsFull(view: HeartsView, now: Date): string | null {
  if (view.fullAt === null) return null;
  return `Full in ${formatRoundedDuration(remainingMs(view.fullAt, now))}`;
}
