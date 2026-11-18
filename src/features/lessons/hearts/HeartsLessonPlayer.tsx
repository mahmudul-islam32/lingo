"use client";

import { useCallback, useMemo, useState } from "react";
import { GAME_CONFIG, type HeartsView, type LessonSession } from "@/contracts";
import { useGainHearts, useHearts, useLoseHearts } from "@/features/gamification";
import {
  LessonPlayer,
  LessonPlayerSkeleton,
  type LessonPlayerHearts,
  type LessonPlayerProps,
} from "../player";
import { LessonHeartsMeter } from "./LessonHeartsMeter";
import { OutOfHeartsScreen } from "./OutOfHeartsScreen";
import { PracticeBadge } from "./PracticeBadge";

/** Same props as `LessonPlayer`; hearts are supplied by this wrapper. */
export type HeartsLessonPlayerProps = Omit<LessonPlayerProps, "hearts" | "heartsSlot"> & {
  /** Called when the lesson ends out of hearts (no result is saved). Optional. */
  onOutOfHearts?: (session: LessonSession) => void;
  /**
   * Practice replay (LES-020, PD-065 §3): the lesson was already completed when it was
   * started. Set by the lesson route (PLT-025). While `GAME_CONFIG.practiceCostsHearts`
   * is false, wrong answers cost no hearts, the lesson may start at 0 hearts and never
   * ends out of hearts, and the header shows a "Practice" badge. Correct answers still
   * earn hearts. Default false.
   */
  practice?: boolean;
  /**
   * The learner has at least one completed lesson (LES-020 AC 15): the out-of-hearts
   * screen then says that practising one earns hearts. Default false.
   */
  hasCompletedLessons?: boolean;
};

interface StartHearts {
  initial: number;
  max: number;
  canStartLesson: boolean;
}

function startHeartsOf(view: HeartsView): StartHearts {
  return { initial: view.current, max: view.max, canStartLesson: view.canStartLesson };
}

/**
 * `LessonPlayer` with hearts (LES-009). Reads `useHearts()` once when the lesson opens
 * and then counts down locally, so a heart that refills mid-lesson is not added (PD-018,
 * AC 14). Each costly "Check" is saved with `useLoseHearts`; a failed save is logged and
 * the lesson goes on (AC 13). At 0 hearts, at start or after the last "Continue", it
 * shows `OutOfHeartsScreen` and never calls `onFinish` (AC 10).
 *
 * LES-020: each correct non-speak Check that costs no heart earns
 * `GAME_CONFIG.heartsGainedPerCorrectAnswer` (capped at the max), shown at once and saved
 * with `useGainHearts` (a failed save is logged). With `practice`, nothing costs hearts.
 *
 * Render with `key={lesson.id}` if the lesson can change under the same route.
 */
export function HeartsLessonPlayer({
  onOutOfHearts,
  practice = false,
  hasCompletedLessons = false,
  ...playerProps
}: HeartsLessonPlayerProps) {
  const hearts = useHearts();
  const loseHearts = useLoseHearts();
  const gainHearts = useGainHearts();
  // Practice is free only while the config says so (ADR-013 §2).
  const freePractice = practice && !GAME_CONFIG.practiceCostsHearts;

  // Captured once, the first time hearts are known (success, or full hearts on error).
  const [start, setStart] = useState<StartHearts | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [outOfHearts, setOutOfHearts] = useState(false);
  if (start === null && hearts.view !== null) {
    const captured = startHeartsOf(hearts.view);
    setStart(captured);
    setRemaining(captured.initial);
  }

  const onLose = useCallback(
    (cost: number) => {
      setRemaining((r) => Math.max(0, r - cost));
      loseHearts(cost).catch((error: unknown) => {
        console.warn("[lessons] could not save a heart loss; continuing in memory", error);
      });
    },
    [loseHearts],
  );

  const onGain = useCallback(
    (amount: number) => {
      setRemaining((r) => Math.min(start?.max ?? GAME_CONFIG.maxHearts, r + amount));
      gainHearts(amount).catch((error: unknown) => {
        console.warn("[lessons] could not save a heart gain; continuing in memory", error);
      });
    },
    [gainHearts, start?.max],
  );

  const handleOutOfHearts = useCallback(
    (session: LessonSession) => {
      setOutOfHearts(true);
      onOutOfHearts?.(session);
    },
    [onOutOfHearts],
  );

  const initial = start?.initial;
  const max = start?.max;
  const heartsConfig = useMemo<LessonPlayerHearts | undefined>(
    () =>
      initial === undefined || max === undefined
        ? undefined
        : {
            initial,
            max,
            gainPerCorrect: GAME_CONFIG.heartsGainedPerCorrectAnswer,
            practice: freePractice,
            onLose,
            onGain,
            onOutOfHearts: handleOutOfHearts,
          },
    [initial, max, freePractice, onLose, onGain, handleOutOfHearts],
  );

  if (start === null || heartsConfig === undefined) return <LessonPlayerSkeleton />;

  if ((!start.canStartLesson && !freePractice) || outOfHearts) {
    // Live view for the countdown lines (hearts may have changed since the start).
    return (
      <OutOfHeartsScreen
        view={hearts.view ?? fallbackView(start)}
        hasCompletedLessons={hasCompletedLessons}
      />
    );
  }

  return (
    <LessonPlayer
      {...playerProps}
      hearts={heartsConfig}
      heartsSlot={
        <span className="inline-flex items-center gap-2">
          {freePractice && <PracticeBadge />}
          <LessonHeartsMeter current={remaining} max={start.max} />
        </span>
      }
    />
  );
}

/** Only used if the live view disappears, which TanStack Query doesn't do once loaded. */
function fallbackView(start: StartHearts): HeartsView {
  return {
    current: 0,
    max: start.max,
    canStartLesson: false,
    nextRefillAt: null,
    fullAt: null,
  };
}
