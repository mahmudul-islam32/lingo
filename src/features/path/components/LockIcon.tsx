/**
 * Padlock for locked lessons (GAM-008 AC5). Own SVG, decorative (`aria-hidden`): the
 * node's accessible name and visible "Locked" text carry the state.
 */
export interface LockIconProps {
  size?: number;
  className?: string;
}

export function LockIcon({ size = 28, className }: LockIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden="true"
      data-icon="lock"
      className={className}
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
