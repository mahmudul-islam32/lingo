import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type CardElement = "div" | "section" | "article" | "li" | "aside";
export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardTone = "default" | "raised" | "accent";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Element to render (default `div`); use `li` inside lists, `section` with a heading. */
  as?: CardElement;
  padding?: CardPadding;
  /** `default` = surface, `raised` = higher surface, `accent` = brand indigo with amber edge. */
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
  default: "bg-surface text-fg border border-border",
  raised: "bg-surface-raised text-fg border border-border shadow-md",
  accent: "bg-night-800 text-night-50 border-2 border-glow-400",
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
