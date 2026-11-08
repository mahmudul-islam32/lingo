import type { ReactNode } from "react";
import { BottomNav } from "../_shell/BottomNav";
import { Main } from "../_shell/Main";
import { OnboardingGate } from "../_shell/OnboardingGate";
import { BOTTOM_NAV_CLEARANCE_CLASS } from "../_shell/main-landmark";

/**
 * Layout for the tabbed screens (`/` and `/profile`): scrolling `<main>` plus the fixed
 * bottom navigation. Content gets bottom padding equal to the nav + safe area, so the
 * last element is never covered. Until onboarding is complete, the gate redirects to
 * `/onboarding` (PLT-004).
 */
export default function TabsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Main className={BOTTOM_NAV_CLEARANCE_CLASS}>
        <OnboardingGate require="onboarded">{children}</OnboardingGate>
      </Main>
      <BottomNav />
    </>
  );
}
