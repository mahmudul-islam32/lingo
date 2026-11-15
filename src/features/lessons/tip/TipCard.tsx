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
 * Lesson tip card (LES-013): Lumi (static idle pose, PD-016), a heading and the tip text.
 * Not an exercise: it lives in the player's scrolling area, the "Start" button sits in
 * the sticky bottom bar (`TipStartBar`) so it never scrolls off screen (AC4).
 * German words inside the tip are not tagged separately (ticket out of scope).
 */
export function TipCard({ tip, knownLanguage, textId, headingId }: TipCardProps) {
  return (
    <section
      aria-labelledby={headingId}
      data-testid="tip-card"
      className="mx-auto w-full max-w-2xl px-4 py-4 motion-safe:animate-slide-up"
    >
      <Card tone="raised" padding="md" className="flex flex-col items-center gap-3 text-center">
        <Lumi pose="idle" size="md" />
        <h2 id={headingId} className="text-xl font-bold">
          Tip
        </h2>
        <p id={textId} lang={knownLanguage} className="text-lg leading-relaxed text-pretty">
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
    <div className="sticky bottom-0 z-10 shrink-0 border-t-2 border-border bg-canvas px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
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
