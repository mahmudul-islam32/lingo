"use client";

import { useCallback, useMemo, useState } from "react";
import type { HeartsView, LessonSession } from "@/contracts";
import { useHearts, useLoseHearts } from "@/features/gamification";
import {
  LessonPlayer,
  LessonPlayerSkeleton,
  type LessonPlayerHearts,
  type LessonPlayerProps,
} from "../player";
import { LessonHeartsMeter } from "./LessonHeartsMeter";
import { OutOfHeartsScreen } from "./OutOfHeartsScreen";

/** Same props as `LessonPlayer`; hearts are supplied by this wrapper. */
export type HeartsLessonPlayerProps = Omit<LessonPlayerProps, "hearts" | "heartsSlot"> & {
  /** Called when the lesson ends out of hearts (no result is saved). Optional. */
  onOutOfHearts?: (session: LessonSession) => void;
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
 * Render with `key={lesson.id}` if the lesson can change under the same route.
 */
export function HeartsLessonPlayer({ onOutOfHearts, ...playerProps }: HeartsLessonPlayerProps) {
  const hearts = useHearts();
  const loseHearts = useLoseHearts();

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

  const handleOutOfHearts = useCallback(
    (session: LessonSession) => {
      setOutOfHearts(true);
      onOutOfHearts?.(session);
    },
    [onOutOfHearts],
  );

  const initial = start?.initial;
  const heartsConfig = useMemo<LessonPlayerHearts | undefined>(
    () =>
      initial === undefined ? undefined : { initial, onLose, onOutOfHearts: handleOutOfHearts },
    [initial, onLose, handleOutOfHearts],
  );

  if (start === null || heartsConfig === undefined) return <LessonPlayerSkeleton />;

  if (!start.canStartLesson || outOfHearts) {
    // Live view for the countdown lines (hearts may have changed since the start).
    return <OutOfHeartsScreen view={hearts.view ?? fallbackView(start)} />;
  }

  return (
    <LessonPlayer
      {...playerProps}
      hearts={heartsConfig}
      heartsSlot={<LessonHeartsMeter current={remaining} max={start.max} />}
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
