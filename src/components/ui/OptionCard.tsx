import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "./cn";
import { CheckIcon, CrossIcon } from "./icons";

export type OptionCardLayout = "row" | "tile";
export type OptionCardStatus = "correct" | "incorrect";

export interface OptionCardProps extends Omit<ComponentPropsWithRef<"button">, "title"> {
  /** Main text (part of the accessible name). */
  title: ReactNode;
  /** Secondary line, e.g. "Strong grammar focus" or "drink · masc.". */
  description?: ReactNode;
  /** Leading element, usually a `Chip` (course code, option number). Decorative or labelled by the chip. */
  leading?: ReactNode;
  /** Trailing text before the check circle, e.g. "20 XP". */
  trailing?: ReactNode;
  /** Selected state: indigo border, soft halo and a check circle (never colour alone). */
  selected?: boolean;
  /** After checking an answer: green or red frame with a check / cross. */
  status?: OptionCardStatus;
  /**
   * `row` (default) = full-width list card with the check circle on the right (onboarding,
   * course picker); `tile` = 2 × 2 grid tile for multiple choice.
   */
  layout?: OptionCardLayout;
  /** Show the empty indicator circle when not selected (radio look). Default true for `row`. */
  showIndicator?: boolean;
}

/**
 * Selectable card (design v2). A native `<button>`: pass `role="radio"` (inside a
 * `role="radiogroup"`) or `role="checkbox"` and it sets `aria-checked`; otherwise it is a
 * toggle button with `aria-pressed`. Keyboard handling (roving tabindex, arrows, number
 * keys) stays with the caller.
 */
export function OptionCard({
  title,
  description,
  leading,
  trailing,
  selected = false,
  status,
  layout = "row",
  showIndicator,
  role,
  type = "button",
  className,
  disabled,
  ...rest
}: OptionCardProps) {
  const checkable = role === "radio" || role === "checkbox" || role === "menuitemradio";
  const indicator = showIndicator ?? layout === "row";
  const frame =
    status === "correct"
      ? "border-success bg-success-soft text-success-fg shadow-3d-success"
      : status === "incorrect"
        ? "border-danger bg-danger-tint text-danger-fg shadow-3d-danger"
        : selected
          ? "border-primary bg-surface shadow-ring-selected"
          : "border-border bg-surface shadow-3d-card enabled:hover:border-primary-ring enabled:active:translate-y-0.5 enabled:active:shadow-3d-card-pressed";
  const mark = status === "incorrect" ? "cross" : selected || status === "correct" ? "check" : null;
  return (
    <button
      type={type}
      role={role}
      aria-checked={checkable ? selected : undefined}
      aria-pressed={checkable ? undefined : selected}
      data-selected={selected ? "" : undefined}
      data-status={status}
      disabled={disabled}
      className={cn(
        "relative w-full border-2 text-left text-fg focus-visible:focus-ring",
        "motion-safe:transition-[border-color,box-shadow,transform] motion-safe:duration-100",
        "disabled:cursor-not-allowed",
        layout === "row"
          ? "flex min-h-16 items-center gap-3.5 rounded-card px-4 py-3"
          : "flex min-h-32 flex-col items-start gap-1.5 rounded-tile p-3.5",
        frame,
        className,
      )}
      {...rest}
    >
      {leading}
      <span className={cn("flex min-w-0 flex-col", layout === "row" && "flex-1")}>
        <span
          className={cn(
            "font-bold",
            layout === "tile" ? "mt-auto font-display text-xl" : "text-[1.0625rem]",
          )}
        >
          {title}
        </span>
        {description && (
          <span className={cn("text-sm", status ? "opacity-90" : "text-fg-muted")}>
            {description}
          </span>
        )}
      </span>
      {trailing && <span className="shrink-0 font-bold text-fg-muted">{trailing}</span>}
      {(indicator || mark) && (
        <span
          aria-hidden="true"
          data-testid={mark === "check" ? "check-icon" : undefined}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border-2",
            layout === "tile" && "absolute top-3 right-3",
            mark === "check" && !status && "border-primary bg-primary text-on-primary",
            status === "correct" && "border-success bg-success text-on-success",
            status === "incorrect" && "border-danger bg-danger text-on-danger",
            !mark && "border-border-strong",
          )}
        >
          {mark === "check" && <CheckIcon size={16} />}
          {mark === "cross" && <CrossIcon size={14} />}
        </span>
      )}
    </button>
  );
}
