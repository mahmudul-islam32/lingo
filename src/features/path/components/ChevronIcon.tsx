/**
 * Chevron for the collapsible level header (GAM-010). Points down; the header rotates it
 * when the level is expanded. Decorative (`aria-hidden`): `aria-expanded` carries the state.
 */
export interface ChevronIconProps {
  size?: number;
  className?: string;
}

export function ChevronIcon({ size = 24, className }: ChevronIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden="true"
      data-icon="chevron"
      className={className}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
