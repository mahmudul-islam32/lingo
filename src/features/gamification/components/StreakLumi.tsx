"use client";

import type { Slug } from "@/contracts";
import { cn, Lumi, Skeleton, VisuallyHidden } from "@/components/ui";
import { useStreak } from "../hooks/use-streak";
import type { UseProgressOptions } from "../hooks/use-user-progress";
import { lumiPoseForStreak } from "../rules/lumi-pose";
import { streakMessage } from "../rules/streak-message";

export interface StreakLumiProps extends UseProgressOptions {
  courseId: Slug;
  className?: string;
}

/** Same box for the message and its skeleton: two lines of `text-base` (AC6, AC8). */
const MESSAGE_BOX = "min-w-0 flex-1 min-h-12";

/**
 * Lumi reflecting the streak (GAM-009): decorative `<Lumi size="md" />` in the pose from
 * `lumiPoseForStreak`, plus one plain-text message (not a live region). Follows `useStreak`,
 * so a finished lesson or local midnight changes pose and text without a reload (AC4).
 * Loading: idle Lumi + text skeleton. Error: idle Lumi only.
 */
export function StreakLumi({ courseId, className, ...options }: StreakLumiProps) {
  const { status, streak, streakStatus } = useStreak(courseId, options);
  const ready = status === "success" && streak !== null && streakStatus !== null;
  const pose = ready ? lumiPoseForStreak(streakStatus) : "idle";

  return (
    <div className={cn("flex items-center gap-3", className)} data-testid="streak-lumi">
      <Lumi pose={pose} size="md" />
      {ready && (
        <p className={cn(MESSAGE_BOX, "text-base text-fg line-clamp-2")}>
          {streakMessage(streakStatus, streak.current)}
        </p>
      )}
      {status === "loading" && (
        <div className={cn(MESSAGE_BOX, "flex items-center")}>
          <Skeleton className="h-4 w-48 max-w-full" />
          <VisuallyHidden>Loading your streak</VisuallyHidden>
        </div>
      )}
    </div>
  );
}
