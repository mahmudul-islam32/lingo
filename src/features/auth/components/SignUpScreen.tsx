"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { safeNextPath } from "@/contracts";
import { Lumi } from "@/components/ui";
import type { ClientLoader } from "../email-auth";
import { AUTH_COPY, checkInboxText } from "../messages";
import { useNextParam } from "../use-next-param";
import { AuthLayout } from "./AuthLayout";
import { EmailAuthForm, LINK_CLASSES, logInHref } from "./EmailAuthForm";
import { AccountSwitchResult } from "./AccountSwitchResult";
import { useSignedInRedirect } from "./SignedInRedirect";
import { useFinishSignIn } from "./use-finish-sign-in";

export interface SignUpScreenProps {
  load?: ClientLoader;
}

/** `/sign-up` (PLT-010 AC 2–5, 7–9, 11). */
export function SignUpScreen({ load }: SignUpScreenProps) {
  const next = useNextParam();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const signIn = useFinishSignIn("sign-up", safeNextPath(next));
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
  if (pendingEmail !== null) return <CheckInbox email={pendingEmail} />;

  return (
    <AuthLayout title={AUTH_COPY.signUpTitle}>
      <EmailAuthForm
        mode="sign-up"
        next={next}
        onSignedIn={signIn.finish}
        onConfirmEmail={setPendingEmail}
        {...(load ? { load } : {})}
      />
      <p className="text-center">
        {AUTH_COPY.haveAccount}{" "}
        <Link href={logInHref(next)} className={LINK_CLASSES}>
          {AUTH_COPY.logIn}
        </Link>
      </p>
    </AuthLayout>
  );
}

/**
 * Email confirmation pending (PLT-010 AC 7, PD-087): the learner stays a guest and loses
 * nothing; the link in the mail finishes the sign-up on `/auth/callback`.
 */
export function CheckInbox({ email }: { email: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <div className="flex flex-col items-center gap-4 pb-10 text-center">
      <Lumi pose="happy" size="md" />
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-3xl font-extrabold tracking-[-0.02em] outline-none"
      >
        {AUTH_COPY.checkInboxTitle}
      </h1>
      <p role="status" className="break-words text-fg-muted [overflow-wrap:anywhere]">
        {checkInboxText(email)}
      </p>
      <Link href="/" className={LINK_CLASSES}>
        {AUTH_COPY.backToLearn}
      </Link>
    </div>
  );
}
