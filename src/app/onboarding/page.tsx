import type { Metadata } from "next";
import { Main } from "../_shell/Main";
import { OnboardingGate } from "../_shell/OnboardingGate";
import { OnboardingFlow } from "./OnboardingFlow";

export const metadata: Metadata = { title: "Get started" };

/**
 * Onboarding (PLT-004): Welcome, Course, Daily goal on one route. Outside the `(tabs)`
 * group, so there is no bottom nav. Learners who already finished it go to `/`.
 */
export default function OnboardingPage() {
  return (
    <Main>
      <OnboardingGate require="not-onboarded">
        <OnboardingFlow />
      </OnboardingGate>
    </Main>
  );
}
