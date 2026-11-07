import { cn } from "./cn";

export type SkeletonShape = "text" | "rect" | "circle";

export interface SkeletonProps {
  shape?: SkeletonShape;
  /** Size utilities, e.g. `"h-16 w-full"` or `"size-24"`. */
  className?: string;
}

const SHAPE: Record<SkeletonShape, string> = {
  text: "h-4 w-full rounded-md",
  rect: "h-16 w-full rounded-card",
  circle: "size-12 rounded-full",
};

/**
 * Decorative placeholder (`aria-hidden`). Wrap a group of skeletons in an element with
 * `role="status"` and a `VisuallyHidden` label such as "Loading lesson".
 */
export function Skeleton({ shape = "text", className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      data-skeleton=""
      className={cn("bg-surface-raised motion-safe:animate-pulse", SHAPE[shape], className)}
    />
  );
}
