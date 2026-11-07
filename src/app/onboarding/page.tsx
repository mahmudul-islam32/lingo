import type { Metadata } from "next";
import { EmptyState } from "../_shell/EmptyState";
import { Main } from "../_shell/Main";

export const metadata: Metadata = { title: "Get started" };

/** Placeholder until onboarding (PLT-004). Outside the `(tabs)` group: no bottom nav. */
export default function OnboardingPage() {
  return (
    <Main className="gap-6 pb-6">
      <h1 className="text-3xl font-bold tracking-tight">Get started</h1>
      <EmptyState message="Onboarding will appear here." />
    </Main>
  );
}
