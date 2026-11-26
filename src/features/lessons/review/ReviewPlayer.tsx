"use client";

import { useState } from "react";
import type { ReviewItem } from "@/contracts";
import { HeartsLessonPlayer, type HeartsLessonPlayerProps } from "../hearts/HeartsLessonPlayer";
import { LessonPlayerError } from "../player/PlayerError";
import { buildReviewLesson } from "./review-lesson";

/**
 * Props of the review player (LES-023): the lesson player's, minus what a review fixes
 * itself (`lesson`, `practice`, `review`, `hasCompletedLessons`), plus the items.
 */
export type ReviewPlayerProps = Omit<
  HeartsLessonPlayerProps,
  "lesson" | "practice" | "review" | "hasCompletedLessons"
> & {
  /**
   * The review, in play order: `ReviewItem`s of one course, 1 to
   * `GAME_CONFIG.reviewSessionSize` (PLT-029 loads them for the first ranked candidates).
   * Read once on mount: render with a new `key` to start another review.
   */
  items: readonly ReviewItem[];
};

const reloadPage = () => window.location.reload();

/**
 * Review session in the lesson player (LES-023, ADR-019, PD-079). Plays the items as one
 * session with the lesson rules (order given, wrong answers re-queued at the end, quit
 * dialog, feedback with each exercise's own explanation, sound effects) and the practice
 * hearts rules (PD-065: free while `GAME_CONFIG.practiceCostsHearts` is false, may start
 * at 0 hearts, correct Checks earn hearts, "Practice" badge, never out of hearts). No tip
 * card; the `main` region is named "Review".
 *
 * `onFinish` gets a summary whose `toLessonResult(summary, { id })` is a review result
 * (`kind: "review"`, `REVIEW_SESSION_ID` ids, one outcome per exercise with its source
 * `lessonId`); show it with `ResultsScreen`, which switches to its review mode.
 * Quit calls `onQuit` and nothing is produced (PD-080).
 */
export function ReviewPlayer({ items, onRetry, onQuit, ...playerProps }: ReviewPlayerProps) {
  const [built] = useState(() => buildReviewLesson(items));
  if (!built) {
    return <LessonPlayerError onBack={onQuit} onRetry={onRetry ?? reloadPage} />;
  }
  return (
    <HeartsLessonPlayer
      {...playerProps}
      {...(onRetry ? { onRetry } : {})}
      onQuit={onQuit}
      lesson={built.lesson}
      review={built.review}
      practice
    />
  );
}
