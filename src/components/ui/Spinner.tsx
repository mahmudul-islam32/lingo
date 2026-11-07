import { cn } from "./cn";
import { VisuallyHidden } from "./VisuallyHidden";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  size?: SpinnerSize;
  /**
   * When set, the spinner is a `role="status"` region with this accessible name
   * (e.g. "Loading"). Without it the spinner is decorative.
   */
  label?: string;
  className?: string;
}

const SIZE_PX: Record<SpinnerSize, number> = { sm: 16, md: 24, lg: 40 };

/** Loading indicator. Rotates only when the user allows motion. */
export function Spinner({ size = "md", label, className }: SpinnerProps) {
  const px = SIZE_PX[size];
  const svg = (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("motion-safe:animate-spin", !label && className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
  if (!label) return svg;
  return (
    <span role="status" className={cn("inline-flex items-center", className)}>
      {svg}
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}
