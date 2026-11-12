import { cn, type GameIconSize } from "@/components/ui";

const PX: Record<GameIconSize, number> = { sm: 16, md: 24, lg: 32 };

export interface StreakFlameIconProps {
  /** Lit = streak extended today (amber, filled); unlit = outlined and muted. */
  lit: boolean;
  size?: GameIconSize;
  className?: string;
}

/**
 * Polyglow's own lantern-flame drawing (GAM-007 AC2): a flame resting on a small lantern
 * cap. Original artwork, `currentColor` only, always decorative (`aria-hidden`): the
 * surrounding item carries the accessible name, including the lit state.
 */
export function StreakFlameIcon({ lit, size = "md", className }: StreakFlameIconProps) {
  const px = PX[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      focusable="false"
      aria-hidden="true"
      data-lit={lit ? "true" : "false"}
      className={cn("shrink-0", lit ? "text-xp" : "text-fg-muted", className)}
    >
      {/* Outer flame */}
      <path
        d="M12 2.5c.6 2.6 2.4 4 3.7 5.6 1.4 1.7 2.3 3.4 2.3 5.6 0 3.5-2.7 6-6 6s-6-2.5-6-6c0-2.3 1.1-4 2.4-5.3.2 1.4.9 2.4 1.9 2.9-.3-3.4.9-6.4 1.7-8.8z"
        fill={lit ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={lit ? 0 : 1.75}
        strokeLinejoin="round"
      />
      {/* Inner glow */}
      <path
        d="M12 11.2c.9 1.3 2.2 2.2 2.2 3.8a2.2 2.2 0 0 1-4.4 0c0-1.2.8-2.2 1.4-2.8.2.5.5.8.8.9 0-.6 0-1.2 0-1.9z"
        fill="currentColor"
        fillOpacity={lit ? 0.45 : 0}
        stroke={lit ? "none" : "currentColor"}
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
      {/* Lantern cap */}
      <rect x="8.5" y="20.5" width="7" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}
