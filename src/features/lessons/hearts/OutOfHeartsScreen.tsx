"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import type { HeartsView } from "@/contracts";
import { Lumi } from "@/components/ui";
import { formatHeartRefill, formatHeartsFull, useMinuteClock } from "@/features/gamification";

export const OUT_OF_HEARTS_HEADING = "You're out of hearts";
/** LES-020 AC 15 (PD-065 §4): shown when the learner has at least one completed lesson. */
export const OUT_OF_HEARTS_PRACTICE_HINT = "Practise a finished lesson to earn hearts.";
export const OUT_OF_HEARTS_REASSURANCE =
  "Hearts come back on their own. Your finished lessons and XP are safe.";

export interface OutOfHeartsScreenProps {
  /** Hearts right now (live `useHearts().view`), for the two time lines. */
  view: HeartsView;
  /** Where "Back to Learn" goes. Default `/`. */
  backHref?: string;
  /** True when the learner has at least one completed lesson: adds the practice line. */
  hasCompletedLessons?: boolean;
}

/** Primary-button look for a link (same tokens as `Button` primary, size lg = 48 px). */
const primaryLinkClasses =
  "inline-flex min-h-12 w-full items-center justify-center rounded-control px-6 text-lg font-semibold " +
  "select-none bg-primary text-on-primary shadow-sm hover:bg-primary-hover " +
  "focus-visible:focus-ring motion-safe:transition-colors";

/**
 * LES-009 AC 2, 8, 9: shown instead of the player when a lesson can't start at 0 hearts
 * and after the "Continue" that follows the last lost heart. Calm, no XP, no stats, no
 * quit button, no purchases (PD-018). With a completed lesson it says that practising
 * one earns hearts (LES-020, PD-065 §4). Saves nothing.
 */
export function OutOfHeartsScreen({
  view,
  backHref = "/",
  hasCompletedLessons = false,
}: OutOfHeartsScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const now = useMinuteClock(true);
  const refill = formatHeartRefill(view, now);
  const full = formatHeartsFull(view, now);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section
      aria-labelledby={headingId}
      data-testid="out-of-hearts"
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-canvas text-fg"
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] text-center">
        <Lumi pose="ember" size="lg" />
        <h1
          ref={headingRef}
          id={headingId}
          tabIndex={-1}
          className="text-2xl font-bold text-balance focus:outline-none"
        >
          {OUT_OF_HEARTS_HEADING}
        </h1>
        {(refill || full) && (
          <div className="flex flex-col gap-1">
            {refill && <p className="text-lg font-semibold">{refill}</p>}
            {full && <p className="text-fg-muted">{full}</p>}
          </div>
        )}
        {hasCompletedLessons && (
          <p data-testid="out-of-hearts-practice" className="max-w-xs font-semibold text-pretty">
            {OUT_OF_HEARTS_PRACTICE_HINT}
          </p>
        )}
        <p className="max-w-xs text-fg-muted text-pretty">{OUT_OF_HEARTS_REASSURANCE}</p>
      </div>
      <div className="sticky bottom-0 bg-canvas px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Link href={backHref} className={primaryLinkClasses}>
          Back to Learn
        </Link>
      </div>
    </section>
  );
}
