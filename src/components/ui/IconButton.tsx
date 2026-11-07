import type { ComponentPropsWithRef, ReactNode } from "react";
import { buttonVariantClasses, controlBaseClasses, type ButtonVariant } from "./Button";
import { cn } from "./cn";

export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends Omit<ComponentPropsWithRef<"button">, "children"> {
  /** Required accessible name, e.g. "Quit lesson", "Dismiss", "Back". */
  label: string;
  /** Decorative icon (rendered `aria-hidden`). */
  icon: ReactNode;
  variant?: ButtonVariant;
  /** `sm` 36 px, `md` 44 px (default, minimum touch target), `lg` 48 px. */
  size?: IconButtonSize;
}

const SIZE: Record<IconButtonSize, string> = {
  sm: "size-9",
  md: "size-11",
  lg: "size-12",
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
