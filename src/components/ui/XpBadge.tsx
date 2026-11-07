import { GAME_ICON_PX, type GameIconSize } from "./HeartIcon";
import { cn } from "./cn";
import { BoltIcon } from "./icons";

export interface XpBadgeProps {
  /** XP amount, e.g. 15. */
  amount: number;
  /** Prefix positive amounts with "+" (e.g. "+5 XP" for a bonus). */
  signed?: boolean;
  size?: GameIconSize;
  /** Overrides the accessible text (default "15 XP" / "+5 XP"). */
  label?: string;
  className?: string;
}

const TEXT: Record<GameIconSize, string> = {
  sm: "text-sm px-2 py-0.5",
  md: "text-base px-3 py-1",
  lg: "text-xl px-4 py-1.5",
};

/** Pill with a bolt icon and "N XP". The visible text is the accessible text. */
export function XpBadge({ amount, signed = false, size = "md", label, className }: XpBadgeProps) {
  const text = `${signed && amount > 0 ? "+" : ""}${amount} XP`;
  return (
    <span
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-surface-raised font-bold text-xp tabular-nums",
        TEXT[size],
        className,
      )}
    >
      <BoltIcon size={GAME_ICON_PX[size]} />
      <span>{text}</span>
    </span>
  );
}
