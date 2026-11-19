import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "./cn";

export interface NavTabProps {
  href: string;
  /** Visible label, e.g. "Learn". It is the accessible name. */
  label: string;
  /** Decorative icon (e.g. `HomeIcon`), rendered `aria-hidden`. */
  icon: ReactNode;
  /** Current tab: indigo and `aria-current="page"` (not colour alone: bolder label + bar). */
  active?: boolean;
  className?: string;
}

/** Classes for a bottom-nav tab (design v2), for callers that render their own element. */
export function navTabClassName(active: boolean): string {
  return cn(
    "relative flex min-h-12 min-w-16 flex-col items-center justify-center gap-1 rounded-chip px-2 text-xs font-bold",
    "focus-visible:focus-ring motion-safe:transition-colors",
    active ? "text-primary" : "text-fg-muted hover:text-fg",
  );
}

/** Bottom navigation tab (icon over label) linking with `next/link`. */
export function NavTab({ href, label, icon, active = false, className }: NavTabProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(navTabClassName(active), className)}
    >
      <span aria-hidden="true" className="inline-flex">
        {icon}
      </span>
      <span>{label}</span>
      {active && (
        <span aria-hidden="true" className="absolute -top-px h-1 w-8 rounded-full bg-primary" />
      )}
    </Link>
  );
}
