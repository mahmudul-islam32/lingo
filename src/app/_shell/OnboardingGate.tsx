"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
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

  const allowed = require === "onboarded" ? onboardingComplete : !onboardingComplete;
  const redirectTo = require === "onboarded" ? ONBOARDING_PATH : HOME_PATH;
  const ready = status === "ready";

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
