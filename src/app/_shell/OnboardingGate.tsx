"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { StoreApi } from "zustand";
import { useStore } from "zustand";
import { guestProfileStore, type GuestProfileState } from "@/features/profile";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

export const ONBOARDING_PATH = "/onboarding";
export const HOME_PATH = "/";

/**
 * `onboarded`: the children need a finished onboarding (the tabs); otherwise go to
 * `/onboarding`. `not-onboarded`: the children are onboarding itself; once it is
 * finished, go to `/`.
 */
export type OnboardingRequirement = "onboarded" | "not-onboarded";

export interface OnboardingGateProps {
  require: OnboardingRequirement;
  children: ReactNode;
  store?: StoreApi<GuestProfileState>;
}

/**
 * First-launch redirects (PLT-004 criterion 9), client-side and based on
 * `profile.onboardedAt` from the guest profile store. Until the profile has loaded it
 * renders the shell loading UI, so a returning learner never sees a flash of
 * onboarding (and a new one never sees a flash of Learn). Uses `router.replace` so Back
 * doesn't bounce between the two routes.
 */
export function OnboardingGate({
  require,
  children,
  store = guestProfileStore,
}: OnboardingGateProps) {
  const router = useRouter();
  const status = useStore(store, (s) => s.status);
  const error = useStore(store, (s) => s.error);
  const onboardingComplete = useStore(store, (s) => s.onboardingComplete);

  const ready = status === "ready";
  // Once onboarding itself was shown, finishing it doesn't redirect to `/`: the flow
  // navigates on its own, straight into Lesson 1 (PLT-007 criterion 6).
  const [admitted, setAdmitted] = useState(false);
  if (require === "not-onboarded" && ready && !onboardingComplete && !admitted) setAdmitted(true);

  const allowed = require === "onboarded" ? onboardingComplete : !onboardingComplete || admitted;
  const redirectTo = require === "onboarded" ? ONBOARDING_PATH : HOME_PATH;

  useEffect(() => {
    // The root layout's GuestProfileBootstrap normally starts this; init() is idempotent.
    if (store.getState().status === "idle") void store.getState().init();
  }, [store]);

  useEffect(() => {
    if (ready && !allowed) router.replace(redirectTo);
  }, [ready, allowed, redirectTo, router]);

  if (status === "error") {
    return (
      <ErrorState
        error={error ?? new Error("Could not load your profile")}
        reset={() => void store.getState().init()}
      />
    );
  }
  if (!ready || !allowed) return <LoadingState />;
  return <>{children}</>;
}
