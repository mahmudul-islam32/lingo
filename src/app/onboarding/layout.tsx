import type { ReactNode } from "react";
import { OfflineBanner } from "../_shell/OfflineBanner";

/** Onboarding has no bottom nav; it shows the offline banner (PLT-006) above its `<main>`. */
export default function OnboardingLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <OfflineBanner />
      {children}
    </>
  );
}
