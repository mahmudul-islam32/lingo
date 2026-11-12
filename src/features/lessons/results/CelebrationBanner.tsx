"use client";

import { useEffect, useRef, useState } from "react";
import { BoltIcon } from "@/components/ui";
import { canAnimateCountUp } from "./use-count-up";

/** Upper bound of the sparkle burst (LES-010 AC 6). */
export const MAX_SPARKLE_MS = 1000;
export const SPARKLE_MS = 900;

/** Sparkle positions around the banner, as `left`/`top` percentages. */
const SPARKLES = [
  { left: 6, top: 10, dx: -10, dy: -10 },
  { left: 22, top: 90, dx: -6, dy: 10 },
  { left: 50, top: 0, dx: 0, dy: -12 },
  { left: 78, top: 92, dx: 6, dy: 10 },
  { left: 94, top: 12, dx: 10, dy: -10 },
] as const;

/** Whether the sparkle may run: needs the Web Animations API and no reduced motion. */
export function canSparkle(): boolean {
  if (!canAnimateCountUp()) return false;
  return typeof Element !== "undefined" && typeof Element.prototype.animate === "function";
}

/**
 * Celebration banner above the stats (LES-010 AC 6): the line plus a short sparkle
 * burst (≤ 1,000 ms) that never covers the content or "Continue". Under
 * `prefers-reduced-motion: reduce` the banner shows without the effect (the sparkle layer
 * is not rendered, and `motion-reduce:hidden` guards it in CSS as well).
 *
 * The text is not a live region itself: the results screen announces it once, after the
 * heading has focus (AC 7).
 */
export function CelebrationBanner({ text }: { text: string }) {
  const [sparkle, setSparkle] = useState(canSparkle);
  const layerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!sparkle || !layerRef.current) return;
    const dots = Array.from(layerRef.current.children) as HTMLElement[];
    const animations = dots.map((dot, i) => {
      const { dx, dy } = SPARKLES[i] ?? { dx: 0, dy: 0 };
      return dot.animate(
        [
          { opacity: 0, transform: "translate(0, 0) scale(0.3)" },
          { opacity: 1, transform: `translate(${dx / 2}px, ${dy / 2}px) scale(1)`, offset: 0.4 },
          { opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(0.6)` },
        ],
        { duration: SPARKLE_MS, delay: 0, easing: "ease-out", fill: "forwards" },
      );
    });
    const last = animations[0];
    if (last) last.onfinish = () => setSparkle(false);
    return () => animations.forEach((a) => a.cancel());
  }, [sparkle]);

  return (
    <div
      data-testid="celebration-banner"
      className="relative flex w-full items-center justify-center gap-2 rounded-card border-2 border-xp bg-surface px-3 py-2 font-bold text-fg shadow-md"
    >
      <span className="text-xp">
        <BoltIcon size={18} />
      </span>
      <p>{text}</p>
      {sparkle && (
        <span
          ref={layerRef}
          aria-hidden="true"
          data-testid="celebration-sparkle"
          className="pointer-events-none absolute inset-0 motion-reduce:hidden"
        >
          {SPARKLES.map((s) => (
            <span
              key={`${s.left}-${s.top}`}
              className="absolute size-2 rounded-full bg-xp opacity-0"
              style={{ left: `${s.left}%`, top: `${s.top}%` }}
            />
          ))}
        </span>
      )}
    </div>
  );
}
