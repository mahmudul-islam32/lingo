"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { safeNextPath } from "@/contracts";
import type { ClientLoader } from "../email-auth";
import { finishSignIn } from "../finish-sign-in";
import { AUTH_COPY } from "../messages";
import { useNextParam } from "../use-next-param";
import { AuthLayout } from "./AuthLayout";
import { EmailAuthForm, LINK_CLASSES, signUpHref } from "./EmailAuthForm";
import { useSignedInRedirect } from "./SignedInRedirect";

export interface LogInScreenProps {
  load?: ClientLoader;
}

/** `/log-in` (PLT-010 AC 6, 8–9, 11). "Forgot password?" arrives with PLT-012 (PD-077). */
export function LogInScreen({ load }: LogInScreenProps) {
  const router = useRouter();
  const next = useNextParam();
  const [signingIn, setSigningIn] = useState(false);
  useSignedInRedirect(!signingIn);

  async function handleSignedIn(session: Session) {
    setSigningIn(true);
    await finishSignIn(session, { method: "log-in" });
    router.replace(safeNextPath(next));
  }

  return (
    <AuthLayout title={AUTH_COPY.logInTitle}>
      <EmailAuthForm
        mode="log-in"
        next={next}
        onSignedIn={handleSignedIn}
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
