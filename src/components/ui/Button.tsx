import type { ComponentPropsWithRef, MouseEvent, ReactNode } from "react";
import { cn } from "./cn";
import { Spinner } from "./Spinner";
import { VisuallyHidden } from "./VisuallyHidden";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  /** `primary` = amber brand action; `success`/`danger` = feedback colours (not brand). */
  variant?: ButtonVariant;
  /** `sm` 36 px (dense UI only), `md` 44 px (default), `lg` 48 px (primary page actions). */
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

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover shadow-sm",
  secondary: "bg-surface-raised text-fg border-2 border-border-strong hover:bg-surface",
  ghost: "bg-transparent text-fg hover:bg-surface-raised",
  danger: "bg-danger text-on-danger hover:bg-danger-hover",
  success: "bg-success text-on-success hover:bg-success-hover",
};

export const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm gap-1.5",
  md: "min-h-11 px-4 text-base gap-2",
  lg: "min-h-12 px-6 text-lg gap-2",
};

/** Base classes shared by Button and IconButton. */
export const controlBaseClasses =
  "inline-flex items-center justify-center rounded-control font-semibold select-none " +
  "focus-visible:focus-ring motion-safe:transition-colors " +
  "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-60";

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
