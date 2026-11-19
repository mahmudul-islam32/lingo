"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import type { HeartsView } from "@/contracts";
import { Card, Lumi } from "@/components/ui";
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

/** Primary-button look for a link (same tokens as v2 `Button` primary, size lg = 56 px). */
const primaryLinkClasses =
  "inline-flex min-h-14 w-full items-center justify-center rounded-control px-6 text-[1.0625rem] font-bold " +
  "select-none bg-primary text-on-primary shadow-3d-primary hover:bg-primary-hover " +
  "active:translate-y-0.5 active:shadow-3d-primary-pressed focus-visible:focus-ring " +
  "motion-safe:transition-[background-color,box-shadow,transform] motion-safe:duration-100";

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
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-surface text-fg"
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 pt-[max(1.5rem,env(safe-area-inset-top))] text-center">
        <span
          aria-hidden="true"
          className="flex size-44 shrink-0 items-center justify-center rounded-full bg-primary-tint"
        >
          <Lumi pose="ember" size="lg" />
        </span>
        <h1
          ref={headingRef}
          id={headingId}
          tabIndex={-1}
          className="font-display text-[1.75rem] leading-tight font-extrabold text-balance focus:outline-none"
        >
          {OUT_OF_HEARTS_HEADING}
        </h1>
        {(refill || full) && (
          <Card tone="default" className="flex w-full flex-col gap-1">
            {refill && <p className="text-[1.0625rem] font-bold text-heart-fg">{refill}</p>}
            {full && <p className="text-fg-muted">{full}</p>}
          </Card>
        )}
        {hasCompletedLessons && (
          <p
            data-testid="out-of-hearts-practice"
            className="w-full rounded-card bg-primary-tint px-4 py-3 font-bold text-pretty text-primary-fg"
          >
            {OUT_OF_HEARTS_PRACTICE_HINT}
          </p>
        )}
        <p className="max-w-xs text-pretty text-fg-muted">{OUT_OF_HEARTS_REASSURANCE}</p>
      </div>
      <div className="sticky bottom-0 bg-surface px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <Link href={backHref} className={primaryLinkClasses}>
          Back to Learn
        </Link>
      </div>
    </section>
  );
}
