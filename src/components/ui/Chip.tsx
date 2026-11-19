import type { ReactNode } from "react";
import { cn } from "./cn";
import { VisuallyHidden } from "./VisuallyHidden";

export type ChipTone = "indigo" | "coral" | "gold" | "pink" | "green" | "neutral";
export type ChipSize = "xs" | "sm" | "md";

export interface ChipProps {
  /** Short visible text, e.g. a course code "DE", an option number "1" or "L3". */
  children: ReactNode;
  /** Colour pair, all AA (tokens.test.ts). Default `indigo`. */
  tone?: ChipTone;
  /** `xs` 28 px (option number), `sm` 40 px (course list), `md` 44 px (top bar). Default `sm`. */
  size?: ChipSize;
  /** Adds the 2 px border used by the top-bar course chip. */
  bordered?: boolean;
  /**
   * Accessible text that replaces the visible code for screen readers, e.g. "German"
   * for "DE". Without it the visible text is read as is.
   */
  label?: string;
  className?: string;
}

const TONE: Record<ChipTone, string> = {
  indigo: "bg-primary-soft text-primary-fg",
  coral: "bg-accent-soft text-accent-fg",
  gold: "bg-xp-soft text-glow-800",
  pink: "bg-pink-soft text-pink-fg",
  green: "bg-success-soft text-success",
  neutral: "bg-surface text-fg-muted border-2 border-border",
};

const SIZE: Record<ChipSize, string> = {
  xs: "min-w-7 h-7 px-1.5 text-xs rounded-lg",
  sm: "min-w-10 h-10 px-2 text-sm rounded-chip",
  md: "min-w-11 h-11 px-2 text-sm rounded-chip",
};

/**
 * Small square-ish code chip (design v2): course codes ("DE"), MC option numbers, level
 * tags. Presentational; not interactive (wrap it in a Button or OptionCard).
 */
export function Chip({
  children,
  tone = "indigo",
  size = "sm",
  bordered = false,
  label,
  className,
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-extrabold tabular-nums",
        TONE[tone],
        SIZE[size],
        bordered && "border-2 border-border",
        className,
      )}
    >
      {label ? (
        <>
          <span aria-hidden="true">{children}</span>
          <VisuallyHidden>{label}</VisuallyHidden>
        </>
      ) : (
        children
      )}
    </span>
  );
}
