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

interface Loss {
  id: number;
  text: string;
}

/**
 * The lesson header's hearts meter (LES-009 AC 3, 6, 7): `HeartsMeter` plus a short
 * shrink when the count drops (skipped under reduced motion) and a persistent polite live
 * region. The message is cleared, then set on the next frame, so two identical messages
 * in a row are both announced.
 */
export function LessonHeartsMeter({ current, max }: LessonHeartsMeterProps) {
  const [prev, setPrev] = useState(current);
  const [loss, setLoss] = useState<Loss>({ id: 0, text: "" });
  const [message, setMessage] = useState("");
  const [shrinkId, setShrinkId] = useState(0);
  const [settledId, setSettledId] = useState(0);

  // Detect a drop during render (no extra effect pass, no flash of the old number).
  if (current !== prev) {
    setPrev(current);
    if (current < prev) {
      const id = loss.id + 1;
      setLoss({ id, text: heartLossAnnouncement(current) });
      setMessage("");
      if (canAnimate()) setShrinkId(id);
    }
  }

  useEffect(() => {
    if (loss.id === 0) return;
    return nextFrame(() => setMessage(loss.text));
  }, [loss]);

  useEffect(() => {
    if (shrinkId === 0) return;
    const timer = setTimeout(() => setSettledId(shrinkId), HEART_LOSS_SHRINK_MS);
    return () => clearTimeout(timer);
  }, [shrinkId]);

  const shrinking = shrinkId !== settledId;

  return (
    <>
      <span
        data-testid="lesson-hearts-meter"
        data-animating={shrinking ? "true" : undefined}
        className={cn(
          "inline-flex origin-center whitespace-nowrap",
          "motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out",
          "motion-reduce:transition-none",
          shrinking && "motion-safe:scale-75",
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
