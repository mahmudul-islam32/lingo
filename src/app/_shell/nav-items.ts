import type { ComponentType } from "react";
import { HomeIcon, TargetIcon, TrophyIcon, UserIcon, type IconProps } from "@/components/ui";

export interface NavItem {
  href: string;
  label: string;
  Icon: ComponentType<IconProps>;
}

export const LEARN_PATH = "/";
export const PRACTICE_PATH = "/practice";
export const LEAGUES_PATH = "/leagues";
export const PROFILE_PATH = "/profile";

/** PD-066 §4: the 4-tab bottom nav of design v2, in this order. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: LEARN_PATH, label: "Learn", Icon: HomeIcon },
  { href: PRACTICE_PATH, label: "Practice", Icon: TargetIcon },
  { href: LEAGUES_PATH, label: "Leagues", Icon: TrophyIcon },
  { href: PROFILE_PATH, label: "Profile", Icon: UserIcon },
];

/** `/` matches only itself; other tabs also match their sub-routes (`/profile/settings`). */
export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
