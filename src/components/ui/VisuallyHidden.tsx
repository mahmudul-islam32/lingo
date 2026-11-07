import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "./cn";

export type VisuallyHiddenProps<E extends ElementType = "span"> = {
  /** Element to render; defaults to `span`. */
  as?: E;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<E>, "as" | "children">;

/**
 * Content for screen readers only (Tailwind `sr-only`). Pass `role="status"` to make it
 * a polite live region, e.g. `<VisuallyHidden role="status">Exercise 2 of 10</VisuallyHidden>`.
 */
export function VisuallyHidden<E extends ElementType = "span">({
  as,
  className,
  children,
  ...rest
}: VisuallyHiddenProps<E>) {
  const Component: ElementType = as ?? "span";
  return (
    <Component className={cn("sr-only", className as string | undefined)} {...rest}>
      {children}
    </Component>
  );
}
