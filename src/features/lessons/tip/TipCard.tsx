"use client";

import type { LanguageCode } from "@/contracts";
import type { Ref } from "react";
import { Button, Card, Lumi } from "@/components/ui";

export interface TipCardProps {
  /** The lesson's `tip` (≤ 280 characters, contract limit). */
  tip: string;
  /** Course `knownLanguage`: the tip is written in it (LES-013 AC5). */
  knownLanguage: LanguageCode;
  /** Id of the tip text, used by the "Start" button's `aria-describedby`. */
  textId: string;
  headingId: string;
}

/**
 * Lesson tip card (LES-013): Lumi (static idle pose, PD-016) in a light indigo circle, a
 * heading and the tip text on a v2 Card (LES-021).
 * Not an exercise: it lives in the player's scrolling area, the "Start" button sits in
 * the sticky bottom bar (`TipStartBar`) so it never scrolls off screen (AC4).
 * German words inside the tip are not tagged separately (ticket out of scope).
 */
export function TipCard({ tip, knownLanguage, textId, headingId }: TipCardProps) {
  return (
    <section
      aria-labelledby={headingId}
      data-testid="tip-card"
      className="mx-auto w-full max-w-2xl px-6 pt-5 pb-6 motion-safe:animate-slide-up"
    >
      <Card tone="default" padding="lg" className="flex flex-col items-center gap-3 text-center">
        <span
          aria-hidden="true"
          className="flex size-28 items-center justify-center rounded-full bg-primary-tint"
        >
          <Lumi pose="idle" size="md" />
        </span>
        <p aria-hidden="true" className="eyebrow mt-1 text-eyebrow">
          Before you start
        </p>
        <h2 id={headingId} className="font-display text-[1.625rem] leading-tight font-bold">
          Tip
        </h2>
        <p
          id={textId}
          lang={knownLanguage}
          className="text-[1.0625rem] leading-relaxed text-pretty"
        >
          {tip}
        </p>
      </Card>
    </section>
  );
}

export interface TipStartBarProps {
  onStart: () => void;
  /** Id of the tip text (read as the button's description). */
  describedBy: string;
  startRef: Ref<HTMLButtonElement>;
}

/** Bottom bar with "Start", same placement and size as the player's "Check" bar. */
export function TipStartBar({ onStart, describedBy, startRef }: TipStartBarProps) {
  return (
    <div className="sticky bottom-0 z-10 shrink-0 border-t-2 border-border bg-surface px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <Button
          ref={startRef}
          variant="primary"
          size="lg"
          fullWidth
          aria-describedby={describedBy}
          onClick={onStart}
        >
          Start
        </Button>
      </div>
    </div>
  );
}
