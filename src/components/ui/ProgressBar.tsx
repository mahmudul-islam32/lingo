import { cn } from "./cn";

export type ProgressTone = "primary" | "success" | "xp";
export type ProgressSize = "sm" | "md" | "lg";

export interface ProgressBarProps {
  /** Current value; clamped to `[0, max]`. */
  value: number;
  /** Maximum (default 100). A max of 0 renders an empty bar. */
  max?: number;
  /** Accessible name (e.g. "Lesson progress"). Provide this or `labelledBy`. */
  label?: string;
  /** id of a visible element that names the bar. */
  labelledBy?: string;
  /** Human-readable value, e.g. "Exercise 3 of 10" (`aria-valuetext`). */
  valueText?: string;
  tone?: ProgressTone;
  size?: ProgressSize;
  className?: string;
}

const TONE: Record<ProgressTone, string> = {
  primary: "bg-progress",
  success: "bg-success",
  xp: "bg-xp",
};

const SIZE: Record<ProgressSize, string> = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

/** `role="progressbar"` with min/max/now (and optional valuetext). Width animates only with motion allowed. */
export function ProgressBar({
  value,
  max = 100,
  label,
  labelledBy,
  valueText,
  tone = "primary",
  size = "md",
  className,
}: ProgressBarProps) {
  const safeMax = Math.max(0, max);
  const now = Math.min(Math.max(0, value), safeMax);
  const percent = safeMax === 0 ? 0 : (now / safeMax) * 100;
  return (
    <div
      role="progressbar"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={now}
      aria-valuetext={valueText}
      className={cn(
        "w-full overflow-hidden rounded-full bg-surface-raised border border-border",
        SIZE[size],
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full motion-safe:transition-[width] motion-safe:duration-300",
          TONE[tone],
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
