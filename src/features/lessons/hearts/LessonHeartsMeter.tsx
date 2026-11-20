"use client";

import { useEffect, useState } from "react";
import { VisuallyHidden, cn } from "@/components/ui";
import { HeartsMeter } from "@/features/gamification";

/** How long the heart stays shrunk; the scale back takes as long (total 300 ms, AC 7). */
export const HEART_LOSS_SHRINK_MS = 150;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** False under `prefers-reduced-motion: reduce` or when we can't tell. */
function canAnimate(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return !window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** How long the heart stays grown after a gain; the scale back takes as long (LES-020 AC 6). */
export const HEART_GAIN_GROW_MS = 150;

/** Live-region text after a gain (LES-020 AC 5). */
export function heartGainAnnouncement(current: number): string {
  return `You earned a heart. ${current} ${current === 1 ? "heart" : "hearts"}.`;
}

/** Live-region text after a loss (LES-009 AC 6). */
export function heartLossAnnouncement(remaining: number): string {
  return remaining <= 0 ? "You lost your last heart." : `You lost a heart. ${remaining} left.`;
}

function nextFrame(callback: () => void): () => void {
  if (typeof window.requestAnimationFrame === "function") {
    const id = window.requestAnimationFrame(callback);
    return () => window.cancelAnimationFrame(id);
  }
  const id = setTimeout(callback, 16);
  return () => clearTimeout(id);
}

export interface LessonHeartsMeterProps {
  /** Hearts left in this lesson (the session's `heartsRemaining`). */
  current: number;
  max: number;
}

interface Change {
  id: number;
  text: string;
}

type Pulse = { id: number; kind: "shrink" | "grow" };

/**
 * The lesson header's hearts meter (LES-009 AC 3, 6, 7; LES-020 AC 5, 6): `HeartsMeter`
 * plus a short shrink when the count drops, a short grow when it rises (both skipped
 * under reduced motion) and a persistent polite live region. The message is cleared, then set on the next frame, so two identical messages
 * in a row are both announced.
 */
export function LessonHeartsMeter({ current, max }: LessonHeartsMeterProps) {
  const [prev, setPrev] = useState(current);
  const [change, setChange] = useState<Change>({ id: 0, text: "" });
  const [message, setMessage] = useState("");
  const [pulse, setPulse] = useState<Pulse>({ id: 0, kind: "shrink" });
  const [settledId, setSettledId] = useState(0);

  // Detect a change during render (no extra effect pass, no flash of the old number).
  if (current !== prev) {
    setPrev(current);
    const id = change.id + 1;
    const gained = current > prev;
    setChange({
      id,
      text: gained ? heartGainAnnouncement(current) : heartLossAnnouncement(current),
    });
    setMessage("");
    if (canAnimate()) setPulse({ id, kind: gained ? "grow" : "shrink" });
  }

  useEffect(() => {
    if (change.id === 0) return;
    return nextFrame(() => setMessage(change.text));
  }, [change]);

  useEffect(() => {
    if (pulse.id === 0) return;
    const ms = pulse.kind === "grow" ? HEART_GAIN_GROW_MS : HEART_LOSS_SHRINK_MS;
    const timer = setTimeout(() => setSettledId(pulse.id), ms);
    return () => clearTimeout(timer);
  }, [pulse]);

  const animating = pulse.id !== settledId;
  const shrinking = animating && pulse.kind === "shrink";
  const growing = animating && pulse.kind === "grow";

  return (
    <>
      <span
        data-testid="lesson-hearts-meter"
        data-animating={animating ? "true" : undefined}
        data-animation={animating ? pulse.kind : undefined}
        className={cn(
          "inline-flex origin-center whitespace-nowrap",
          // v2 header: the count is in the hearts text colour (#BE123C, AA on white).
          "[&_span[aria-hidden]]:text-heart-fg",
          "motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out",
          "motion-reduce:transition-none",
          shrinking && "motion-safe:scale-75",
          growing && "motion-safe:scale-125",
        )}
      >
        <HeartsMeter current={current} max={max} />
      </span>
      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {message}
      </VisuallyHidden>
    </>
  );
}
