import type { ComponentPropsWithRef, ReactNode } from "react";
import { buttonVariantClasses, controlBaseClasses, type ButtonVariant } from "./Button";
import { cn } from "./cn";

export type IconButtonSize = "sm" | "md" | "lg" | "xl";

export interface IconButtonProps extends Omit<ComponentPropsWithRef<"button">, "children"> {
  /** Required accessible name, e.g. "Quit lesson", "Dismiss", "Back". */
  label: string;
  /** Decorative icon (rendered `aria-hidden`). */
  icon: ReactNode;
  /**
   * `ghost` (default) renders a muted icon; `secondary` a white 12 px-radius tile with a
   * border (design v2 settings / flag buttons). Other variants as Button.
   */
  variant?: ButtonVariant;
  /** `sm` 36 px, `md` 44 px (default, minimum touch target), `lg` 48 px, `xl` 64 px (v2). */
  size?: IconButtonSize;
}

const SIZE: Record<IconButtonSize, string> = {
  sm: "size-9 rounded-chip",
  md: "size-11 rounded-chip",
  lg: "size-12 rounded-chip",
  xl: "size-16 rounded-tile",
};

/** Icon-only ghost buttons use the muted ink (the lesson "X", toast dismiss). */
const VARIANT_OVERRIDES: Partial<Record<ButtonVariant, string>> = {
  ghost: "text-fg-muted enabled:hover:text-fg",
};

/** Square icon-only button with a required label. Supports `ref` (e.g. to restore focus). */
export function IconButton({
  label,
  icon,
  variant = "ghost",
  size = "md",
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        controlBaseClasses,
        buttonVariantClasses[variant],
        VARIANT_OVERRIDES[variant],
        SIZE[size],
        "shrink-0 p-0",
        className,
      )}
      {...rest}
    >
      <span aria-hidden="true" className="inline-flex">
        {icon}
      </span>
    </button>
  );
}
