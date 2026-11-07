"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import type { LessonResult } from "@/contracts";
import { BoltIcon, Button, Card, Lumi, VisuallyHidden } from "@/components/ui";
import { formatAccuracy, formatDuration } from "./format";
import { useCountUp } from "./use-count-up";
import { useSaveResult, type SaveLessonResult } from "./use-save-result";

export interface ResultsScreenProps {
  /**
   * The finished lesson, built with `toLessonResult(summary, { id })` (XP from
   * `calculateXp`). Keep the same object/id across renders: the screen saves it once.
   */
  result: LessonResult;
  /** `ProgressRepository.saveLessonResult` (PLT-008). Runs in the background. */
  save: SaveLessonResult;
  /** Primary "Continue": back to Learn (`/`). Works whatever the save status. */
  onContinue: () => void;
  /** Called once the result is stored (e.g. invalidate `["progress", courseId]`). */
  onSaved?: (result: LessonResult) => void;
  /** Optional secondary "Practice again" (replay the same lesson, PD-008). */
  onRetryLesson?: () => void;
}

export const RESULTS_HEADING = "Lesson complete!";
export const SAVE_ERROR_MESSAGE = "We couldn't save this lesson on your device.";

function StatCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Card
      as="li"
      padding="sm"
      tone="raised"
      className="flex min-w-0 flex-row items-center justify-between gap-2 min-[340px]:flex-col min-[340px]:justify-center"
    >
      <span className="text-sm font-semibold text-fg-muted">{label}</span>
      <span className="text-2xl font-bold tabular-nums">{children}</span>
    </Card>
  );
}

/**
 * LES-008 results screen. Presentational: the route (PLT-007) builds the result and
 * passes the repository's save function. Fits 375 × 667 without scrolling.
 */
export function ResultsScreen({
  result,
  save,
  onContinue,
  onSaved,
  onRetryLesson,
}: ResultsScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const { status, retry } = useSaveResult(result, save, onSaved);
  const xpShown = useCountUp(result.xpEarned);
  const perfectBonus = result.xp.perfectBonus;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section
      aria-labelledby={headingId}
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-canvas px-4 pt-6 pb-4 text-fg"
    >
      <div className="flex flex-1 flex-col items-center gap-4 text-center">
        <div className="flex size-24 shrink-0 items-center justify-center">
          <Lumi pose="celebrating" size="md" />
        </div>

        <h1
          ref={headingRef}
          id={headingId}
          tabIndex={-1}
          className="text-2xl font-bold focus:outline-none"
        >
          {RESULTS_HEADING}
        </h1>

        {perfectBonus > 0 && (
          <p className="font-semibold text-xp">Perfect lesson! +{perfectBonus} bonus XP</p>
        )}

        <ul
          aria-label="Lesson stats"
          className="grid w-full grid-cols-1 gap-2 min-[340px]:grid-cols-3"
        >
          <StatCard label="XP earned">
            <span aria-hidden="true" className="inline-flex items-center gap-1 text-xp">
              <BoltIcon size={20} />
              {xpShown}
            </span>
            <VisuallyHidden>{result.xpEarned}</VisuallyHidden>
          </StatCard>
          <StatCard label="Accuracy">{formatAccuracy(result.accuracy)}</StatCard>
          <StatCard label="Time">{formatDuration(result.durationMs)}</StatCard>
        </ul>

        {status === "error" && (
          <div
            role="alert"
            className="flex w-full flex-col items-center gap-2 rounded-card bg-danger-soft p-3 text-danger-fg"
          >
            <p className="font-semibold">{SAVE_ERROR_MESSAGE}</p>
            <Button variant="secondary" size="md" onClick={retry}>
              Try again
            </Button>
          </div>
        )}
        <VisuallyHidden role="status">{status === "saved" ? "Lesson saved." : ""}</VisuallyHidden>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        {onRetryLesson && (
          <Button variant="ghost" size="md" fullWidth onClick={onRetryLesson}>
            Practice again
          </Button>
        )}
        <Button variant="primary" size="lg" fullWidth onClick={onContinue}>
          Continue
        </Button>
      </div>
    </section>
  );
}
