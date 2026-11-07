"use client";

import { useEffect, useState } from "react";
import { Skeleton, VisuallyHidden, cn } from "@/components/ui";

/** Delay before the skeleton becomes visible, so fast loads don't flash (UX notes). */
export const SKELETON_DELAY_MS = 200;

/** Loading state (criterion 14): progress bar + card skeleton, `role="status"` "Loading lesson". */
export function LessonPlayerSkeleton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), SKELETON_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div role="status" className="flex h-dvh flex-col bg-canvas text-fg">
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
          <Skeleton className="h-3 flex-1 rounded-full" />
        </div>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton shape="rect" className="h-64" />
        <div className="mt-auto pb-4">
          <Skeleton shape="rect" className="h-12" />
        </div>
      </div>
    </div>
  );
}
