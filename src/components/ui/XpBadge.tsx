import { GAME_ICON_PX, type GameIconSize } from "./HeartIcon";
import { cn } from "./cn";
import { BoltIcon } from "./icons";

export interface XpBadgeProps {
  /** XP amount, e.g. 15. */
  amount: number;
  /** Prefix positive amounts with "+" (e.g. "+5 XP" for a bonus). */
  signed?: boolean;
  size?: GameIconSize;
  /**
   * `pill` (default) = gold-tint pill; `plain` = icon + text only, as in the v2 top bar
   * ("340 XP" next to the streak and hearts).
   */
  variant?: "pill" | "plain";
  /** Overrides the accessible text (default "15 XP" / "+5 XP"). */
  label?: string;
  className?: string;
}

const TEXT: Record<GameIconSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
};

const PILL: Record<GameIconSize, string> = {
  sm: "px-2 py-0.5",
  md: "px-3 py-1",
  lg: "px-4 py-1.5",
};

/** Pill with a bolt icon and "N XP". The visible text is the accessible text. */
export function XpBadge({
  amount,
  signed = false,
  size = "md",
  variant = "pill",
  label,
  className,
}: XpBadgeProps) {
  const text = `${signed && amount > 0 ? "+" : ""}${amount} XP`;
  return (
    <span
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1 font-bold text-xp tabular-nums",
        variant === "pill" && "rounded-full bg-xp-soft",
        variant === "pill" && PILL[size],
        TEXT[size],
        className,
      )}
    >
      <BoltIcon size={GAME_ICON_PX[size]} className="shrink-0 text-xp-gold" />
      <span>{text}</span>
    </span>
  );
}
