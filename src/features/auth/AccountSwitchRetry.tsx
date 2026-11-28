"use client";

import { useEffect } from "react";
import { getLocalSession } from "@/lib/offline";
import { accountsEnabled } from "@/lib/supabase";
import { readPendingSwitch, runAccountSwitch } from "./account-switch";
import { sessionStore } from "./session-store";

async function retryIfPending(): Promise<void> {
  const { ready, status, user } = sessionStore.getState();
  if (!ready || status !== "signed-in" || !user) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  const local = await getLocalSession();
  if ((await local.profile.getIdentity()).kind !== "guest") return;
  const pending = readPendingSwitch();
  await runAccountSwitch(user.id, pending?.userId === user.id ? pending.method : "log-in");
}

/**
 * PLT-013 criterion 8: a signed-in device whose identity is still a guest (the upload
 * failed or the tab closed) retries the switch on the next start and on every `online`
 * event while the session exists. Never acts on a sign-in in this tab (the screen runs
 * it). Renders nothing; a no-op without the accounts flag.
 */
export function AccountSwitchRetry() {
  useEffect(() => {
    if (!accountsEnabled()) return;
    let active = true;
    const retry = () => {
      if (active) void retryIfPending().catch(() => undefined);
    };
    void sessionStore.getState().init().then(retry);
    window.addEventListener("online", retry);
    return () => {
      active = false;
      window.removeEventListener("online", retry);
    };
  }, []);
  return null;
}
