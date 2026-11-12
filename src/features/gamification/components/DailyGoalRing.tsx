"use client";

import { useId } from "react";
import type { DailyGoalProgress, Slug } from "@/contracts";
import { CheckIcon, Skeleton, VisuallyHidden, cn } from "@/components/ui";
import { dailyGoalFraction } from "../rules/daily-goal";
import {
  DAILY_GOAL_ERROR_TEXT,
  DAILY_GOAL_LABEL,
  DAILY_GOAL_LOADING_TEXT,
  goalAriaValueNow,
  goalHint,
  goalValueText,
  goalValueTextForScreenReaders,
  isGoalReached,
} from "../rules/daily-goal-format";
import { useUserProgress, type UseProgressOptions } from "../hooks/use-user-progress";

export interface DailyGoalRingProps extends UseProgressOptions {
  courseId: Slug;
  className?: string;
}

/** Ring geometry in SVG user units (rendered at 80 px, `size-20`). */
const VIEWBOX = 36;
const RADIUS = 15;
const STROKE = 4;

const ROW = "flex items-center gap-3";
const RING_SIZE = "size-20 shrink-0";

/**
 * Today's XP toward the daily goal (GAM-006). Reads `useUserProgress(courseId)`; the goal
 * comes from settings via GAM-003 (never hard-coded here).
 */
export function DailyGoalRing({ courseId, className, ...options }: DailyGoalRingProps) {
  const { status, progress } = useUserProgress(courseId, options);

  if (status === "error") {
    return <p className={cn("text-sm text-fg-muted", className)}>{DAILY_GOAL_ERROR_TEXT}</p>;
  }
  if (!progress) {
    return (
      <div role="status" className={cn(ROW, className)}>
        <VisuallyHidden>{DAILY_GOAL_LOADING_TEXT}</VisuallyHidden>
        <Skeleton shape="circle" className={RING_SIZE} />
        <div className="flex w-24 flex-col gap-2">
          <Skeleton shape="text" className="h-3 w-16" />
          <Skeleton shape="text" className="h-4" />
        </div>
      </div>
    );
  }
  return <DailyGoalRingView goal={progress.dailyGoal} className={className} />;
}

export interface DailyGoalRingViewProps {
  goal: Pick<DailyGoalProgress, "earnedXp" | "goalXp">;
  className?: string;
}

/** Presentational ring (no data access): exported for the results screen and stories. */
export function DailyGoalRingView({ goal, className }: DailyGoalRingViewProps) {
  const labelId = useId();
  const reached = isGoalReached(goal);
  const fraction = Math.max(0, dailyGoalFraction(goal));
  const offset = 100 - fraction * 100;
  const center = VIEWBOX / 2;

  return (
    <div className={cn(ROW, className)} data-reached={reached ? "true" : "false"}>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={goal.goalXp}
        aria-valuenow={goalAriaValueNow(goal)}
        aria-valuetext={goalValueTextForScreenReaders(goal)}
        className={cn("relative", RING_SIZE)}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          className="size-full -rotate-90"
        >
          <circle
            cx={center}
            cy={center}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-border-strong"
          />
          <circle
            data-testid="daily-goal-progress"
            cx={center}
            cy={center}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap={fraction > 0 ? "round" : "butt"}
            pathLength={100}
            strokeDasharray="100 100"
            strokeDashoffset={offset}
            className={cn(
              reached ? "stroke-success" : "stroke-xp",
              // AC12: ≤ 600 ms from the previous value; no animation under reduced motion.
              "transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none",
            )}
          />
        </svg>
        {reached && (
          <span className="absolute inset-0 flex items-center justify-center text-success">
            <CheckIcon size={28} />
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-col">
        <span id={labelId} className="text-sm font-semibold text-fg-muted">
          {DAILY_GOAL_LABEL}
        </span>
        <span className="text-lg font-bold text-fg">{goalValueText(goal)}</span>
        <span className={cn("text-sm", reached ? "font-semibold text-fg" : "text-fg-muted")}>
          {goalHint(goal)}
        </span>
      </div>
    </div>
  );
}
