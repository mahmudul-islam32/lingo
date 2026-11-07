"use client";

import { useEffect, useState } from "react";

/** Upper bound for the XP count-up (LES-008 criterion 11). */
export const MAX_COUNT_UP_MS = 800;
export const DEFAULT_COUNT_UP_MS = 600;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * True only when the browser can animate and the user has not asked for reduced motion.
 * Without `matchMedia` we cannot tell, so we do not animate.
 */
export function canAnimateCountUp(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return false;
  if (typeof window.requestAnimationFrame !== "function") return false;
  return !window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Counts from 0 to `target` with `requestAnimationFrame` in at most 800 ms. Under
 * `prefers-reduced-motion: reduce` it returns `target` at once (no animation at all).
 * The screen is only ever mounted on the client, after the lesson's last "Continue".
 */
export function useCountUp(target: number, durationMs: number = DEFAULT_COUNT_UP_MS): number {
  const [animate] = useState(canAnimateCountUp);
  const [value, setValue] = useState(() => (animate ? 0 : target));
  const duration = Math.min(MAX_COUNT_UP_MS, Math.max(0, durationMs));

  useEffect(() => {
    if (!animate) return;
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      start ??= now;
      const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      setValue(Math.round(target * easeOutCubic(t)));
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [animate, target, duration]);

  return animate ? value : target;
}
