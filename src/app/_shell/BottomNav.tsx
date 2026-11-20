"use client";

import { usePathname } from "next/navigation";
import { NavTab, cn } from "@/components/ui";
import { BOTTOM_NAV_HEIGHT_CLASS } from "./main-landmark";
import { NAV_ITEMS, isActivePath } from "./nav-items";

/**
 * Fixed bottom tab bar (PLT-001, redesign v2 PLT-026): Learn, Practice, Leagues, Profile.
 * Each tab is a `NavTab` (icon over label). The active tab is indigo with
 * `aria-current="page"` and an indicator bar, so it is not marked by colour alone;
 * inactive tabs are muted grey.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className={cn("mx-auto flex w-full max-w-md px-2", BOTTOM_NAV_HEIGHT_CLASS)}>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <li key={href} className="flex flex-1 items-center justify-center">
              <NavTab
                href={href}
                label={label}
                active={active}
                icon={<Icon size={26} />}
                className="w-full"
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
