"use client";

import Link from "next/link";
import { safeNextPath } from "@/contracts";
import type { ClientLoader } from "../email-auth";
import { AUTH_COPY } from "../messages";
import { useNextParam } from "../use-next-param";
import { AuthLayout } from "./AuthLayout";
import { EmailAuthForm, LINK_CLASSES, signUpHref } from "./EmailAuthForm";
import { AccountSwitchResult } from "./AccountSwitchResult";
import { useSignedInRedirect } from "./SignedInRedirect";
import { useFinishSignIn } from "./use-finish-sign-in";

export interface LogInScreenProps {
  load?: ClientLoader;
}

/** `/log-in` (PLT-010 AC 6, 8–9, 11). "Forgot password?" arrives with PLT-012 (PD-077). */
export function LogInScreen({ load }: LogInScreenProps) {
  const next = useNextParam();
  const signIn = useFinishSignIn("log-in", safeNextPath(next));
  useSignedInRedirect();

  if (signIn.result) {
    return (
      <AccountSwitchResult
        outcome={signIn.result}
        next={safeNextPath(next)}
        onRetry={() => void signIn.retry()}
        retrying={signIn.retrying}
      />
    );
  }

  return (
    <AuthLayout title={AUTH_COPY.logInTitle}>
      <EmailAuthForm
        mode="log-in"
        next={next}
        onSignedIn={signIn.finish}
        {...(load ? { load } : {})}
      />
      <p className="text-center">
        {AUTH_COPY.noAccount}{" "}
        <Link href={signUpHref(next)} className={LINK_CLASSES}>
          {AUTH_COPY.createAccount}
        </Link>
      </p>
    </AuthLayout>
  );
}
