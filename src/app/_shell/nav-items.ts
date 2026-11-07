import type { ComponentType } from "react";
import { LearnIcon, ProfileIcon, type NavIconProps } from "./icons";

export interface NavItem {
  href: string;
  label: string;
  Icon: ComponentType<NavIconProps>;
}

/** PD-005: exactly two tabs in the MVP. No Leaderboard tab until leagues ship. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Learn", Icon: LearnIcon },
  { href: "/profile", label: "Profile", Icon: ProfileIcon },
];

/** `/` matches only itself; other tabs also match their sub-routes (`/profile/settings`). */
export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
