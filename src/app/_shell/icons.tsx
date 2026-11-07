/**
 * Original inline icons for the bottom navigation (no icon fonts). Each has an outline
 * and a filled variant; the filled one marks the active tab (criterion 4: not colour alone).
 */

export interface NavIconProps {
  filled?: boolean;
  size?: number;
  className?: string;
}

/** An open book with a small spark above it. */
export function LearnIcon({ filled = false, size = 26, className }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M12 7.5c-1.9-1.4-4.6-2-8-1.8v12c3.4-.2 6.1.4 8 1.8 1.9-1.4 4.6-2 8-1.8v-12c-3.4-.2-6.1.4-8 1.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
      <path
        d="M12 7.5v12"
        stroke={filled ? "var(--color-surface)" : "currentColor"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 1.8v2.4M10.8 3h2.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A head-and-shoulders silhouette. */
export function ProfileIcon({ filled = false, size = 26, className }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="currentColor"
        strokeWidth="1.8"
        fill={filled ? "currentColor" : "none"}
      />
      <path
        d="M4 20.5c.6-4 3.8-6.5 8-6.5s7.4 2.5 8 6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}
