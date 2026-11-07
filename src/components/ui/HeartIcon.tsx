import { cn } from "./cn";

export type GameIconSize = "sm" | "md" | "lg";

export const GAME_ICON_PX: Record<GameIconSize, number> = { sm: 16, md: 24, lg: 32 };

export interface HeartIconProps {
  /** Filled = an available heart; outline = a lost heart. Default true. */
  filled?: boolean;
  size?: GameIconSize;
  /** Accessible name; without it the icon is decorative. */
  label?: string;
  className?: string;
}

/** Heart (lives) icon in the functional `heart` colour. */
export function HeartIcon({ filled = true, size = "md", label, className }: HeartIconProps) {
  const px = GAME_ICON_PX[size];
  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      focusable="false"
      data-filled={filled ? "true" : "false"}
      className={cn(filled ? "text-heart" : "text-fg-muted", className)}
      {...a11y}
    >
      <path
        d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.8 3.9 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.3 0 5.6 3.3 4.4 6.7-1.7 4.7-9.2 9.3-9.2 9.3z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 2}
        strokeLinejoin="round"
      />
    </svg>
  );
}
