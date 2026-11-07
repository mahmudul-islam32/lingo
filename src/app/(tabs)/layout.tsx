import type { ReactNode } from "react";
import { BottomNav } from "../_shell/BottomNav";
import { Main } from "../_shell/Main";
import { OfflineBanner } from "../_shell/OfflineBanner";
import { BOTTOM_NAV_CLEARANCE_CLASS } from "../_shell/main-landmark";

/**
 * Layout for the tabbed screens (`/` and `/profile`): scrolling `<main>` plus the fixed
 * bottom navigation. Content gets bottom padding equal to the nav + safe area, so the
 * last element is never covered. The offline banner (PLT-006) sits in the flow above
 * `<main>`, so it never overlaps the nav or page content.
 */
export default function TabsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <OfflineBanner />
      <Main className={BOTTOM_NAV_CLEARANCE_CLASS}>{children}</Main>
      <BottomNav />
    </>
  );
}
