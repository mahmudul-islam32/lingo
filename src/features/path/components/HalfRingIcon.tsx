/**
 * Ring with its left half filled: the lesson being played (GAM-008 AC5, `in_progress`).
 * Decorative (`aria-hidden`); colour via `currentColor`.
 */
export interface HalfRingIconProps {
  size?: number;
  className?: string;
}

export function HalfRingIcon({ size = 32, className }: HalfRingIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      focusable="false"
      aria-hidden="true"
      data-icon="half-ring"
      className={className}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={3} opacity={0.35} />
      <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" />
      <path d="M12 3a9 9 0 0 0 0 18" stroke="currentColor" strokeWidth={3} />
    </svg>
  );
}
