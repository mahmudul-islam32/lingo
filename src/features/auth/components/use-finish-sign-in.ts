"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { runAccountSwitch, type AccountSwitchOutcome } from "../account-switch";
import { finishSignIn, type SignInMethod } from "../finish-sign-in";

type ResultOutcome = Extract<AccountSwitchOutcome, { kind: "saved" | "failed" | "other-account" }>;

/**
 * Shared by the sign-in screens: runs `finishSignIn()`, then either navigates to `next`
 * (nothing to show: adopted, already this account) or returns the outcome to render.
 */
export function useFinishSignIn(method: SignInMethod, next: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResultOutcome | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const show = useCallback(
    (outcome: AccountSwitchOutcome) => {
      if (outcome.kind === "adopted" || outcome.kind === "already-account") {
        router.replace(next);
        return;
      }
      setResult(outcome);
    },
    [next, router],
  );

  const finish = useCallback(
    async (session: Session) => {
      setBusy(true);
      setUserId(session.user.id);
      show(await finishSignIn(session, { method }));
    },
    [method, show],
  );

  const retry = useCallback(async () => {
    if (!userId || retrying) return;
    setRetrying(true);
    show(await runAccountSwitch(userId, method));
    setRetrying(false);
  }, [method, retrying, show, userId]);

  return { busy, result, finish, retry, retrying };
}
