/**
 * Open padlock for playable lessons of a skipped level (GAM-011 AC7). Own SVG, decorative
 * (`aria-hidden`): the node's accessible name and visible "Open" text carry the state.
 */
export interface OpenLockIconProps {
  size?: number;
  className?: string;
}

export function OpenLockIcon({ size = 28, className }: OpenLockIconProps) {
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
      data-icon="lock-open"
      className={className}
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 7.5-1.9" />
    </svg>
  );
}
