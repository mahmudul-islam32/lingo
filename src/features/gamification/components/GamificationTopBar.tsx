"use client";

import { useRef, useState, type ReactNode } from "react";
import type { Slug } from "@/contracts";
import { Chip, cn, Skeleton, VisuallyHidden, XpBadge } from "@/components/ui";
import { useHearts } from "../hooks/use-hearts";
import { useStreak } from "../hooks/use-streak";
import { useUserProgress, type UseProgressOptions } from "../hooks/use-user-progress";
import { courseChip } from "../rules/course-chip";
import { STREAK_UNAVAILABLE_LABEL, streakAccessibleName } from "../rules/streak-message";
import { HeartsDialog } from "./HeartsDialog";
import { HeartsMeter } from "./HeartsMeter";
import { StreakFlameIcon } from "./StreakFlameIcon";

export const XP_UNAVAILABLE_LABEL = "XP unavailable";
export const TOP_BAR_LABEL = "Your progress";
export const TOP_BAR_LOADING_TEXT = "Loading your progress";

export interface GamificationTopBarProps extends UseProgressOptions {
  courseId: Slug;
  /** Positioning from the page, e.g. `"sticky top-0 z-10"` (PLT-009). */
  className?: string;
}

/** Every item has the same fixed height, so loading → loaded never shifts layout (AC10). */
const ITEM = "flex h-11 min-w-0 items-center justify-center";
/** Final widths of the three stats, shared by the skeleton. */
const WIDTH = { streak: "min-w-16", xp: "min-w-24", hearts: "min-w-14" } as const;

/** Course chip (GAM-012 AC1): needs no data, so it shows while the stats load too. */
function CourseChipItem({ courseId }: { courseId: Slug }) {
  const chip = courseChip(courseId);
  return (
    <li className={ITEM} data-testid="top-bar-course">
      <Chip tone="coral" size="md" bordered label={chip.label}>
        {chip.code}
      </Chip>
    </li>
  );
}

function Bar({
  className,
  children,
  after,
}: {
  className?: string;
  children: ReactNode;
  after?: ReactNode;
}) {
  return (
    <section aria-label={TOP_BAR_LABEL} className={cn("bg-canvas px-5 pt-3 pb-2", className)}>
      <ul className="flex items-center justify-between gap-2">{children}</ul>
      {after}
    </section>
  );
}

function Unavailable({ label, className }: { label: string; className?: string }) {
  return (
    <span role="img" aria-label={label} className={cn(ITEM, "font-bold text-fg-muted", className)}>
      <span aria-hidden="true">–</span>
    </span>
  );
}

/**
 * Learn top bar (GAM-007, restyled in GAM-012 per screen 2): the course chip ("DE"),
 * streak (coral flame), total XP (gold bolt) and hearts (rose), in that order. No heading
 * of its own; a labelled `<section>` with a list (AC9). Hearts open the "Hearts"
 * dialog (AC6). Values follow the GAM-003/GAM-005 queries, so a finished lesson or a heart
 * refill updates them without a reload (AC8).
 */
export function GamificationTopBar({ courseId, className, ...options }: GamificationTopBarProps) {
  const { status, progress } = useUserProgress(courseId, options);
  const streak = useStreak(courseId, options);
  const hearts = useHearts();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (status === "loading" || hearts.status === "pending") {
    return (
      <Bar
        className={className}
        after={<VisuallyHidden role="status">{TOP_BAR_LOADING_TEXT}</VisuallyHidden>}
      >
        <CourseChipItem courseId={courseId} />
        {(["streak", "xp", "hearts"] as const).map((key) => (
          <li key={key} className={ITEM} data-testid="top-bar-skeleton">
            <Skeleton className={cn("h-8 rounded-full", WIDTH[key])} />
          </li>
        ))}
      </Bar>
    );
  }

  const view = hearts.view;
  const streakState = streak.status === "success" ? streak.streak : null;
  const streakStatus = streak.status === "success" ? streak.streakStatus : null;

  return (
    <Bar className={className}>
      <CourseChipItem courseId={courseId} />
      <li className={ITEM}>
        {streakState && streakStatus ? (
          <span
            role="img"
            aria-label={streakAccessibleName(streakStatus, streakState.current)}
            data-streak-status={streakStatus}
            className={cn("inline-flex items-center gap-1 tabular-nums", WIDTH.streak)}
          >
            <StreakFlameIcon lit={streakStatus === "extended"} />
            <span
              aria-hidden="true"
              className="text-base font-bold leading-none text-accent-strong"
            >
              {streakState.current}
            </span>
          </span>
        ) : (
          <Unavailable label={STREAK_UNAVAILABLE_LABEL} className={WIDTH.streak} />
        )}
      </li>
      <li className={ITEM}>
        {status === "success" && progress ? (
          <span
            role="img"
            aria-label={`Total XP: ${progress.totalXp}`}
            className={cn("inline-flex justify-center", WIDTH.xp)}
          >
            <XpBadge amount={progress.totalXp} size="md" variant="plain" />
          </span>
        ) : (
          <Unavailable label={XP_UNAVAILABLE_LABEL} className={WIDTH.xp} />
        )}
      </li>
      <li className={ITEM}>
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`Hearts: ${view.current} of ${view.max}`}
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-control px-2",
            "hover:bg-surface-raised focus-visible:focus-ring",
            WIDTH.hearts,
          )}
        >
          <HeartsMeter current={view.current} max={view.max} tone="rose" />
        </button>
        <HeartsDialog
          open={open}
          onClose={() => setOpen(false)}
          view={view}
          returnFocusRef={buttonRef}
        />
      </li>
    </Bar>
  );
}
