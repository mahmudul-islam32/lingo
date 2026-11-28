"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { safeNextPath, type AuthErrorCode } from "@/contracts";
import { Lumi } from "@/components/ui";
import { exchangeCode, type ClientLoader } from "../email-auth";
import { finishSignIn } from "../finish-sign-in";
import { AUTH_COPY, AUTH_ERROR_MESSAGES } from "../messages";
import { LINK_CLASSES } from "./EmailAuthForm";

export interface AuthCallbackScreenProps {
  load?: ClientLoader;
}

interface CallbackParams {
  code: string | null;
  error: string | null;
  next: string;
}

export function readCallbackParams(search: string): CallbackParams {
  const params = new URLSearchParams(search);
  return {
    code: params.get("code"),
    error: params.get("error") ?? params.get("error_code"),
    next: safeNextPath(params.get("next")),
  };
}

/**
 * `/auth/callback` (ADR-020 §3): every link back from Supabase Auth. PLT-010 handles the
 * email confirmation: `?code=…` is exchanged for a session, `finishSignIn()` runs and the
 * learner goes to `next` (same-origin paths only) or `/`. An `?error=…` or a failed
 * exchange shows the `link_expired` copy with a way back. The code is exchanged once,
 * also under Strict Mode's double effects.
 */
export function AuthCallbackScreen({ load }: AuthCallbackScreenProps) {
  const router = useRouter();
  const started = useRef(false);
  const [failure, setFailure] = useState<AuthErrorCode | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const { code, error, next } = readCallbackParams(window.location.search);
    void (async () => {
      if (error || !code) {
        setFailure("link_expired");
        return;
      }
      const outcome = await exchangeCode(code, load ? { load } : {});
      if (outcome.kind === "error") {
        setFailure(outcome.code === "network" ? "network" : "link_expired");
        return;
      }
      await finishSignIn(outcome.session, { method: "sign-up" });
      router.replace(next);
    })();
  }, [load, router]);

  if (failure) {
    return (
      <div className="flex flex-col items-center gap-4 pb-10 text-center">
        <Lumi pose="ember" size="md" />
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.02em]">
          {failure === "network" ? "No connection" : "Link expired"}
        </h1>
        <p role="alert">{AUTH_ERROR_MESSAGES[failure]}</p>
        <Link href="/log-in" className={LINK_CLASSES}>
          {AUTH_COPY.logIn}
        </Link>
        <Link href="/" className={LINK_CLASSES}>
          {AUTH_COPY.backToLearn}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 pb-10 text-center">
      <Lumi pose="happy" size="md" />
      <p role="status" className="font-display text-2xl font-bold">
        {AUTH_COPY.signingIn}
      </p>
    </div>
  );
}
