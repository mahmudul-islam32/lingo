"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";
import { BOTTOM_NAV_HEIGHT_CLASS } from "./main-landmark";
import { NAV_ITEMS, isActivePath } from "./nav-items";

/**
 * Fixed bottom tab bar (PLT-001). The active tab has `aria-current="page"`, a filled icon,
 * bold label and an amber indicator bar, so it is not marked by colour alone.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className={cn("mx-auto flex w-full max-w-md", BOTTOM_NAV_HEIGHT_CLASS)}>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <li key={href} className="flex flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-control text-xs",
                  "focus-visible:focus-ring motion-safe:transition-colors",
                  active ? "font-bold text-fg" : "font-medium text-fg-muted hover:text-fg",
                )}
              >
                <span
                  aria-hidden="true"
                  data-testid={active ? "nav-indicator" : undefined}
                  className={cn(
                    "absolute top-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-b-full",
                    active ? "bg-primary" : "bg-transparent",
                  )}
                />
                <Icon filled={active} className={active ? "text-primary" : undefined} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
