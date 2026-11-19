import type { ReactNode } from "react";
import { cn } from "./cn";

export type StatTileTone = "gold" | "indigo" | "green" | "coral" | "neutral";
export type StatTileLayout = "header" | "inline";

export interface StatTileProps {
  /** Short label, e.g. "Total XP", "Time", "Day streak". */
  label: ReactNode;
  /** The number, e.g. 15, "3:42", "92%". Rendered in the display font. */
  value: ReactNode;
  /** Colour variant. Default `indigo`. */
  tone?: StatTileTone;
  /**
   * `header` (default) = coloured uppercase label strip on top and the value below
   * (lesson complete); `inline` = white tile with an optional icon, value then label
   * (profile stats).
   */
  layout?: StatTileLayout;
  /** Decorative icon (bolt, flame …), rendered `aria-hidden`. */
  icon?: ReactNode;
  /** Element to render. Use `li` inside a `<ul>` of stats. Default `div`. */
  as?: "div" | "li";
  className?: string;
}

const HEADER: Record<StatTileTone, { frame: string; strip: string; value: string }> = {
  gold: { frame: "border-xp-gold", strip: "bg-xp-gold text-on-xp-gold", value: "text-xp" },
  indigo: {
    frame: "border-primary",
    strip: "bg-primary text-on-primary",
    value: "text-primary-fg",
  },
  green: { frame: "border-success", strip: "bg-success text-on-success", value: "text-success" },
  coral: {
    frame: "border-accent-edge",
    strip: "bg-accent-soft text-accent-fg",
    value: "text-accent-strong",
  },
  neutral: { frame: "border-border", strip: "bg-surface-raised text-fg-muted", value: "text-fg" },
};

const ICON: Record<StatTileTone, string> = {
  gold: "text-xp-gold",
  indigo: "text-primary",
  green: "text-success",
  coral: "text-accent",
  neutral: "text-fg-subtle",
};

/**
 * A labelled statistic (design v2). The label comes first in the DOM so screen readers
 * read "Total XP, 15"; the visual order follows the layout.
 */
export function StatTile({
  label,
  value,
  tone = "indigo",
  layout = "header",
  icon,
  as: Component = "div",
  className,
}: StatTileProps) {
  if (layout === "inline") {
    return (
      <Component
        className={cn(
          "flex items-center gap-3 rounded-card border-2 border-border bg-surface p-3.5",
          className,
        )}
      >
        {icon && (
          <span aria-hidden="true" className={cn("inline-flex shrink-0", ICON[tone])}>
            {icon}
          </span>
        )}
        <span className="flex min-w-0 flex-col-reverse">
          <span className="text-sm text-fg-muted">{label}</span>
          <span className="font-display text-xl leading-tight font-bold text-fg tabular-nums">
            {value}
          </span>
        </span>
      </Component>
    );
  }
  const t = HEADER[tone];
  return (
    <Component
      className={cn(
        "flex flex-col overflow-hidden rounded-card border-2 bg-surface text-center",
        t.frame,
        className,
      )}
    >
      <span className={cn("px-2 py-1.5 text-xs font-extrabold tracking-wide uppercase", t.strip)}>
        {label}
      </span>
      <span
        className={cn(
          "flex items-center justify-center gap-1 px-2 py-3 font-display text-2xl font-bold tabular-nums",
          t.value,
        )}
      >
        {icon && (
          <span aria-hidden="true" className={cn("inline-flex", ICON[tone])}>
            {icon}
          </span>
        )}
        {value}
      </span>
    </Component>
  );
}
