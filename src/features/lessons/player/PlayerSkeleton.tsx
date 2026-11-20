"use client";

import { useEffect, useState } from "react";
import { Skeleton, VisuallyHidden, cn } from "@/components/ui";

/** Delay before the skeleton becomes visible, so fast loads don't flash (UX notes). */
export const SKELETON_DELAY_MS = 200;

/**
 * Loading state (criterion 14): header + 4 option-card placeholders (design v2),
 * `role="status"` "Loading lesson".
 */
export function LessonPlayerSkeleton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), SKELETON_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div role="status" className="flex h-dvh flex-col bg-surface text-fg">
      <VisuallyHidden>Loading lesson</VisuallyHidden>
      <div
        data-testid="player-skeleton"
        className={cn(
          "mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-3",
          visible ? "opacity-100 motion-safe:animate-fade-in" : "opacity-0",
        )}
      >
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" className="size-11" />
          <Skeleton className="h-4 flex-1 rounded-full" />
          <Skeleton className="h-6 w-10" />
        </div>
        <div className="flex flex-col gap-2 px-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-3/4" />
        </div>
        <div className="grid grid-cols-2 gap-3 px-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} shape="rect" className="h-32 rounded-tile" />
          ))}
        </div>
        <div className="mt-auto pb-4">
          <Skeleton shape="rect" className="h-14" />
        </div>
      </div>
    </div>
  );
}
