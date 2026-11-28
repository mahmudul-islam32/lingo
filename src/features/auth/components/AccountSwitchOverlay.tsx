"use client";

import { useEffect, useRef } from "react";
import { Lumi } from "@/components/ui";
import { useAccountSwitchPhase } from "../account-switch";
import { AUTH_COPY } from "../messages";

/**
 * "Saving your progress…" (PLT-013 criterion 5) while the guest's data is uploaded, from
 * a sign-in screen or an automatic retry. It covers the whole app, so no lesson can be
 * started meanwhile. Mounted once by the root layout; renders nothing otherwise.
 */
export function AccountSwitchOverlay() {
  const phase = useAccountSwitchPhase();
  const ref = useRef<HTMLDivElement>(null);
  const saving = phase === "saving";
  useEffect(() => {
    if (saving) ref.current?.focus();
  }, [saving]);
  if (!saving) return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      data-testid="saving-progress"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-canvas px-6 text-center outline-none"
    >
      <Lumi pose="happy" size="md" />
      <p role="status" className="font-display text-2xl font-bold">
        {AUTH_COPY.savingProgress}
      </p>
    </div>
  );
}
