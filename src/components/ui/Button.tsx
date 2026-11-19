import type { ComponentPropsWithRef, MouseEvent, ReactNode } from "react";
import { cn } from "./cn";
import { Spinner } from "./Spinner";
import { VisuallyHidden } from "./VisuallyHidden";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "soft";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  /**
   * `primary` = indigo brand action with a 3D edge; `secondary` = white outlined;
   * `ghost` = indigo text link style; `soft` = indigo tint (v2, e.g. "0.7x" slow audio);
   * `success`/`danger` = feedback colours (not brand). Disabled renders grey and flat.
   */
  variant?: ButtonVariant;
  /** `sm` 36 px (dense UI only), `md` 52 px (default), `lg` 56 px (primary page actions). */
  size?: ButtonSize;
  fullWidth?: boolean;
  /**
   * Shows a spinner, sets `aria-busy` and ignores clicks, but keeps focus on the
   * button (it is `aria-disabled`, not `disabled`).
   */
  loading?: boolean;
  /** Screen-reader text announced while loading. Default "Loading". */
  loadingLabel?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/** Pressed = 2 px down with a shorter edge (design system v2 "3D" depth). */
const PRESS = "enabled:active:translate-y-0.5";

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: `bg-primary text-on-primary shadow-3d-primary enabled:hover:bg-primary-hover ${PRESS} enabled:active:shadow-3d-primary-pressed`,
  secondary: `bg-surface text-fg border-2 border-border shadow-3d-card enabled:hover:bg-primary-tint ${PRESS} enabled:active:shadow-3d-card-pressed`,
  ghost: "bg-transparent text-primary enabled:hover:bg-primary-tint",
  danger: `bg-danger text-on-danger shadow-3d-danger enabled:hover:bg-danger-hover ${PRESS} enabled:active:shadow-3d-danger-pressed`,
  success: `bg-success text-on-success shadow-3d-success enabled:hover:bg-success-hover ${PRESS} enabled:active:shadow-3d-success-pressed`,
  soft: `bg-primary-soft text-primary-fg shadow-3d-soft enabled:hover:bg-primary-ring ${PRESS} enabled:active:shadow-3d-soft-pressed`,
};

export const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm gap-1.5 rounded-chip",
  md: "min-h-13 px-5 text-base gap-2",
  lg: "min-h-14 px-6 text-[1.0625rem] gap-2",
};

/** Base classes shared by Button and IconButton. */
export const controlBaseClasses =
  "inline-flex items-center justify-center rounded-control font-bold select-none " +
  "focus-visible:focus-ring motion-safe:transition-[color,background-color,box-shadow,transform] motion-safe:duration-100 " +
  "disabled:cursor-not-allowed disabled:bg-disabled disabled:text-on-disabled disabled:border-transparent disabled:shadow-none " +
  "aria-disabled:cursor-not-allowed aria-busy:opacity-80";

/** Text button. Native `<button>`, `type="button"` by default; Enter and Space work natively. */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  loadingLabel = "Loading",
  leftIcon,
  rightIcon,
  disabled,
  type = "button",
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={disabled || loading ? true : undefined}
      aria-busy={loading ? true : undefined}
      onClick={handleClick}
      className={cn(
        controlBaseClasses,
        buttonVariantClasses[variant],
        buttonSizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner size="sm" />
          <VisuallyHidden>{loadingLabel}</VisuallyHidden>
        </>
      ) : (
        leftIcon && <span aria-hidden="true">{leftIcon}</span>
      )}
      <span className="min-w-0 text-balance">{children}</span>
      {rightIcon && !loading && <span aria-hidden="true">{rightIcon}</span>}
    </button>
  );
}
