"use client";

import Link from "next/link";
import { useId } from "react";
import type { Slug } from "@/contracts";
import { Card, Skeleton, VisuallyHidden, cn } from "@/components/ui";
import { useReviewQueue, type ReviewQueue } from "@/features/gamification";
import {
  REVIEW_ANYWAY_TEXT,
  REVIEW_CARD_TITLE,
  REVIEW_CAUGHT_UP_TEXT,
  REVIEW_HREF,
  REVIEW_LOADING_TEXT,
  REVIEW_NO_HISTORY_TEXT,
  REVIEW_START_TEXT,
  reviewDueText,
} from "./copy";
import { PRIMARY_LINK, SOFT_LINK } from "./link-styles";

export interface ReviewCardProps {
  /** Course to review. Default: the active course. */
  courseId?: Slug;
  /** IANA timezone for "today" (tests inject one). Default: the device timezone. */
  timeZone?: string;
}

export interface ReviewCardViewProps {
  /** From `useReviewQueue`. */
  queue: Pick<ReviewQueue, "status" | "dueCount" | "eligibleCount">;
}

/**
 * Presentational Review card (GAM-015 AC10–AC14). A `section` named "Review" in every
 * rendered state; `null` on a read error so the lesson list works as before. It never
 * checks hearts and has no daily cap (PD-065, PD-071 §2): the link is always offered
 * once there is history.
 */
export function ReviewCardView({ queue }: ReviewCardViewProps) {
  const headingId = useId();
  if (queue.status === "error") return null;

  if (queue.status === "loading") {
    return (
      <section aria-label={REVIEW_CARD_TITLE} aria-busy="true" data-testid="review-card">
        <VisuallyHidden>{REVIEW_LOADING_TEXT}</VisuallyHidden>
        <Skeleton shape="rect" className="h-42 rounded-card" />
      </section>
    );
  }

  const { dueCount, eligibleCount } = queue;
  const state = eligibleCount === 0 ? "empty" : dueCount >= 1 ? "due" : "caught-up";
  const line =
    state === "empty"
      ? REVIEW_NO_HISTORY_TEXT
      : state === "due"
        ? reviewDueText(dueCount)
        : REVIEW_CAUGHT_UP_TEXT;

  return (
    <Card
      as="section"
      aria-labelledby={headingId}
      padding="md"
      tone="default"
      data-testid="review-card"
      data-state={state}
      className="flex min-h-42 flex-col gap-3"
    >
      <h2 id={headingId} className="font-display text-xl leading-tight font-bold text-fg">
        {REVIEW_CARD_TITLE}
      </h2>
      <p className="break-words text-fg-muted">{line}</p>
      {state === "due" && (
        <Link href={REVIEW_HREF} className={cn(PRIMARY_LINK, "w-full")}>
          {REVIEW_START_TEXT}
        </Link>
      )}
      {state === "caught-up" && (
        <Link href={REVIEW_HREF} className={cn(SOFT_LINK, "self-start")}>
          {REVIEW_ANYWAY_TEXT}
        </Link>
      )}
    </Card>
  );
}

/**
 * Practice "Review" card (GAM-015 AC9–AC14): reads `useReviewQueue({ courseId })` and
 * renders `ReviewCardView`. Both links go to `/review` (PLT-029).
 */
export function ReviewCard({ courseId, timeZone }: ReviewCardProps) {
  const queue = useReviewQueue({
    ...(courseId ? { courseId } : {}),
    ...(timeZone ? { timeZone } : {}),
  });
  return <ReviewCardView queue={queue} />;
}
