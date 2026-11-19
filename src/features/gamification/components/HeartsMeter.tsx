import { cn, HeartIcon, type GameIconSize } from "@/components/ui";

export interface HeartsMeterProps {
  /** Hearts available now (`HeartsView.current`). */
  current: number;
  /** Maximum hearts (`HeartsView.max`). */
  max: number;
  size?: GameIconSize;
  /**
   * Count colour: `default` ink (lesson header), `rose` = `heart-fg` as in the v2 top bar
   * (GAM-012). Both AA on white and the canvas.
   */
  tone?: "default" | "rose";
  className?: string;
}

const TEXT: Record<GameIconSize, string> = { sm: "text-sm", md: "text-base", lg: "text-lg" };

/**
 * Heart icon + count, e.g. "♥ 4" (GAM-005 AC 11, 12). Presentational only: no hooks and no
 * data access, so it can move to `src/components/ui` unchanged. Filled icon while
 * `current > 0`, outline at 0. Accessible name: "Hearts: N of max".
 */
export function HeartsMeter({
  current,
  max,
  size = "md",
  tone = "default",
  className,
}: HeartsMeterProps) {
  return (
    <span
      role="img"
      aria-label={`Hearts: ${current} of ${max}`}
      className={cn("inline-flex items-center gap-1 tabular-nums", className)}
    >
      <HeartIcon filled={current > 0} size={size} />
      <span
        aria-hidden="true"
        className={cn(
          tone === "rose" ? "text-heart-fg" : "text-fg",
          "font-bold leading-none",
          TEXT[size],
        )}
      >
        {current}
      </span>
    </span>
  );
}
