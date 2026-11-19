import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type CardElement = "div" | "section" | "article" | "li" | "aside";
export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardTone = "default" | "raised" | "accent" | "flat" | "tint" | "warm";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Element to render (default `div`); use `li` inside lists, `section` with a heading. */
  as?: CardElement;
  padding?: CardPadding;
  /**
   * `default` = white with a 3 px bottom edge (design v2); `raised` = white with a deeper
   * neutral edge; `accent` = indigo banner (unit header); `flat` = white, border only (v2);
   * `tint` = indigo tint panel (v2); `warm` = coral tint panel, e.g. the streak banner (v2).
   */
  tone?: CardTone;
  children?: ReactNode;
}

const PADDING: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const TONE: Record<CardTone, string> = {
  default: "bg-surface text-fg border-2 border-border shadow-3d-card",
  raised: "bg-surface text-fg border-2 border-border shadow-3d-neutral",
  accent: "bg-primary text-on-primary rounded-banner",
  flat: "bg-surface text-fg border-2 border-border",
  tint: "bg-primary-tint text-fg",
  warm: "bg-accent-tint text-fg",
};

/** Presentational container. Not interactive by itself: put a button or link inside. */
export function Card({
  as: Component = "div",
  padding = "md",
  tone = "default",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Component className={cn("rounded-card", TONE[tone], PADDING[padding], className)} {...rest}>
      {children}
    </Component>
  );
}
