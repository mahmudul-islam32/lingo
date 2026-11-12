"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useStore, type StoreApi } from "zustand";
import { Button, Card, Lumi } from "@/components/ui";
import { guestProfileStore, type GuestProfileState } from "@/features/profile";
import { shouldShowInstallCard } from "@/lib/offline";
import { installPromptStore, type InstallPromptState } from "../_pwa/install-prompt-store";
import { HOME_PATH } from "./OnboardingGate";

export const INSTALL_TITLE = "Install Polyglow";
export const INSTALL_BODY = "Open it from your home screen, even offline.";
export const IOS_STEPS = "Tap Share, then Add to Home Screen";

/**
 * Starts capturing `beforeinstallprompt` as soon as the app hydrates (root layout), so the
 * event is kept even when it fires during onboarding or on another tab. Renders nothing.
 */
export function InstallPromptCapture({
  store = installPromptStore,
}: {
  store?: StoreApi<InstallPromptState>;
}) {
  useEffect(() => {
    store.getState().init();
  }, [store]);
  return null;
}

export interface InstallCardProps {
  store?: StoreApi<InstallPromptState>;
  profileStore?: StoreApi<GuestProfileState>;
  /** Injected clock for tests. */
  now?: () => number;
}

/**
 * "Install Polyglow" card at the top of the Learn page (PLT-005 criteria 2-6, 9). Shows the
 * native install prompt where the browser offers one, and the Share steps on iOS. Polite
 * `role="status"` so screen readers announce it without interrupting.
 */
export function InstallCard({
  store = installPromptStore,
  profileStore = guestProfileStore,
  now = Date.now,
}: InstallCardProps) {
  const pathname = usePathname();
  const ready = useStore(store, (s) => s.ready);
  const hasPromptEvent = useStore(store, (s) => s.promptEvent !== null);
  const dismissedAt = useStore(store, (s) => s.dismissedAt);
  const isStandalone = useStore(store, (s) => s.isStandalone);
  const isIos = useStore(store, (s) => s.isIos);
  const onboarded = useStore(profileStore, (s) => s.onboardingComplete);
  // Accepted in this session: never bring the card back (criterion 3).
  const [accepted, setAccepted] = useState(false);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    store.getState().init();
  }, [store]);

  const mode =
    ready && !accepted
      ? shouldShowInstallCard({
          now: now(),
          dismissedAt,
          isStandalone,
          onboarded,
          onLearnTab: pathname === HOME_PATH,
          hasPromptEvent,
          isIos,
        })
      : "hidden";

  if (mode === "hidden") return null;

  const dismiss = () => store.getState().dismiss(now());
  const install = async () => {
    const outcome = await store.getState().install(now());
    if (outcome === "accepted") setAccepted(true);
  };

  return (
    <Card
      as="div"
      tone="raised"
      role="status"
      aria-live="polite"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      data-testid="install-card"
      data-mode={mode}
      className="flex items-start gap-3 motion-safe:animate-fade-in"
    >
      <Lumi pose="happy" size="sm" />
      <div className="min-w-0 flex-1">
        <h2 id={titleId} className="text-lg font-bold">
          {INSTALL_TITLE}
        </h2>
        <p id={bodyId} className="mt-1 text-sm text-fg-muted">
          {mode === "prompt" ? INSTALL_BODY : `${IOS_STEPS}.`}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {mode === "prompt" ? (
            <>
              <Button size="sm" onClick={() => void install()}>
                Install
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                Not now
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={dismiss}>
              Got it
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
