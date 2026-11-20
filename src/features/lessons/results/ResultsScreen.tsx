"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { LessonResult } from "@/contracts";
import { BoltIcon, Button, Lumi, StatTile, VisuallyHidden } from "@/components/ui";
import { useProgressInputs } from "@/features/gamification";
import { CelebrationBanner } from "./CelebrationBanner";
import { formatAccuracy, formatDuration } from "./format";
import { computeLessonImpact } from "./lesson-impact";
import { ResultsGamificationRows } from "./ResultsGamificationRows";
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
/** How long the celebration stays in the live region before it is emptied (FIX-010). */
export const ANNOUNCEMENT_CLEAR_MS = 1000;

/** Decorative confetti around Lumi's circle (design v2 screen 6): static, no motion. */
const CONFETTI = [
  { className: "top-2.5 left-1.5 size-3.5 rotate-[20deg] rounded-[4px] bg-accent" },
  { className: "top-7 right-1 size-3 rounded-full bg-xp-gold" },
  { className: "bottom-[1.125rem] left-0 size-2.5 rounded-full bg-night-500" },
  { className: "right-[1.375rem] bottom-1.5 size-3.5 -rotate-[15deg] rounded-[4px] bg-pink-400" },
] as const;

function CelebrationArt() {
  return (
    <div
      aria-hidden="true"
      data-testid="results-art"
      className="relative flex size-28 shrink-0 items-center justify-center [@media(min-height:740px)]:size-40"
    >
      <span className="absolute inset-0 rounded-full bg-primary-tint" />
      {CONFETTI.map((dot) => (
        <span key={dot.className} className={`absolute ${dot.className}`} />
      ))}
      <Lumi pose="celebrating" size="md" className="relative" />
    </div>
  );
}

/** "Perfect lesson! +5 bonus XP" (LES-008 AC 5). */
export function perfectLessonText(bonus: number): string {
  return `Perfect lesson! +${bonus} bonus XP`;
}

/**
 * Line for the gold celebration pill under the heading, or `null` for no pill (FIX-010).
 * Streak and daily-goal events are not repeated here: the coral streak banner already
 * shows "Streak started!" / "Streak extended!" and the goal row "Daily goal reached!", so
 * the pill only carries what is said nowhere else, the perfect-lesson bonus.
 */
export function celebrationPillText(perfectBonus: number): string | null {
  return perfectBonus > 0 ? perfectLessonText(perfectBonus) : null;
}

/**
 * LES-008 results screen. Presentational: the route (PLT-007) builds the result and
 * passes the repository's save function. Fits 375 × 667 without scrolling.
 * Design v2 (LES-021, screen 6): Lumi in a light indigo circle with confetti, three
 * coloured StatTiles (Total XP gold, Time indigo, Accuracy green), the coral streak
 * banner and the daily-goal row, then Continue and the optional "Practice again".
 * Each line is shown once (FIX-010): the gold pill only for the perfect-lesson bonus;
 * the streak and goal events live in their rows (and the polite announcement, AC 7).
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

  // LES-010: streak and daily goal before/after this lesson. The query is normally warm
  // from the lesson player; if not, the rows appear as soon as the local read resolves.
  // Pure and a single pass over the results, so it simply runs on every render.
  const impact = computeLessonImpact(result, useProgressInputs(result.courseId));
  const celebration = impact?.celebration ?? null;
  const pillText = celebrationPillText(perfectBonus);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // AC 7: announce the celebration once per result, after the heading focus has run.
  const [announcement, setAnnouncement] = useState("");
  const announcedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!celebration || announcedFor.current === result.id) return;
    announcedFor.current = result.id;
    const text = celebration;
    let fired = false;
    const frame = requestAnimationFrame(() => {
      fired = true;
      setAnnouncement(text);
    });
    return () => {
      if (fired) return;
      cancelAnimationFrame(frame);
      announcedFor.current = null; // StrictMode / unmount before the frame: try again
    };
  }, [celebration, result.id]);
  // FIX-010: once spoken, empty the live region so reading the page (browse mode) meets
  // the line only once, in its row. Clearing a polite region is not announced.
  useEffect(() => {
    if (!announcement) return;
    const timer = setTimeout(() => setAnnouncement(""), ANNOUNCEMENT_CLEAR_MS);
    return () => clearTimeout(timer);
  }, [announcement]);

  return (
    <section
      aria-labelledby={headingId}
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-surface px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-fg"
    >
      <div className="flex flex-1 flex-col items-center gap-2.5 text-center [@media(min-height:740px)]:gap-4">
        <CelebrationArt />

        <div className="flex flex-col items-center gap-1">
          <h1
            ref={headingRef}
            id={headingId}
            tabIndex={-1}
            className="font-display text-[2rem] leading-tight font-extrabold tracking-[-0.02em] focus:outline-none"
          >
            {RESULTS_HEADING}
          </h1>
        </div>

        {pillText && <CelebrationBanner text={pillText} />}

        <ul
          aria-label="Lesson stats"
          className="grid w-full grid-cols-1 gap-2.5 min-[340px]:grid-cols-3"
        >
          <StatTile
            as="li"
            tone="gold"
            label="Total XP"
            className="min-w-0"
            value={
              <>
                <span aria-hidden="true" className="inline-flex items-center gap-1">
                  <BoltIcon size={18} className="text-xp-gold" />
                  {xpShown}
                </span>
                <VisuallyHidden>{result.xpEarned}</VisuallyHidden>
              </>
            }
          />
          <StatTile
            as="li"
            tone="indigo"
            label="Time"
            className="min-w-0"
            value={formatDuration(result.durationMs)}
          />
          <StatTile
            as="li"
            tone="green"
            label="Accuracy"
            className="min-w-0"
            value={formatAccuracy(result.accuracy)}
          />
          {impact && <ResultsGamificationRows impact={impact} />}
        </ul>

        {status === "error" && (
          <div
            role="alert"
            className="flex w-full flex-col items-center gap-2 rounded-card border-2 border-danger-border bg-danger-tint p-3 text-danger-fg"
          >
            <p className="font-bold">{SAVE_ERROR_MESSAGE}</p>
            <Button variant="secondary" size="md" onClick={retry}>
              Try again
            </Button>
          </div>
        )}
        <VisuallyHidden role="status">{status === "saved" ? "Lesson saved." : ""}</VisuallyHidden>
        <VisuallyHidden aria-live="polite" data-testid="celebration-announcement">
          {announcement}
        </VisuallyHidden>
      </div>

      <div className="flex flex-col gap-1 pt-3">
        <Button variant="primary" size="lg" fullWidth onClick={onContinue}>
          Continue
        </Button>
        {onRetryLesson && (
          <Button variant="ghost" size="md" fullWidth onClick={onRetryLesson}>
            Practice again
          </Button>
        )}
      </div>
    </section>
  );
}
