"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import type { AuthErrorCode } from "@/contracts";
import { Button } from "@/components/ui";
import { useOnlineStatus } from "@/lib/offline";
import { logInWithEmail, signUpWithEmail, type ClientLoader } from "../email-auth";
import { AUTH_COPY, AUTH_ERROR_MESSAGES } from "../messages";
import { validateCredentials, type FieldError } from "../validation";
import { PasswordField, TextField } from "./fields";

export type AuthMode = "sign-up" | "log-in";

const FIELD_MESSAGES: Record<FieldError, string> = {
  invalid_email: AUTH_COPY.invalidEmail,
  short_password: AUTH_COPY.shortPassword,
  missing_password: AUTH_COPY.missingPassword,
};

export const LINK_CLASSES =
  "inline-flex min-h-12 items-center font-bold text-primary underline-offset-4 hover:underline focus-visible:focus-ring rounded-control px-1";

export interface EmailAuthFormProps {
  mode: AuthMode;
  /** `next` of the page URL (only same-origin paths are followed, ADR-020 §3). */
  next?: string | null;
  onSignedIn: (session: Session) => Promise<void> | void;
  /** Sign-up only: no session yet, the confirmation mail is on its way (PLT-010 AC 7). */
  onConfirmEmail?: (email: string) => void;
  /** Rendered between the password field and the error/submit (e.g. "Forgot password?"). */
  extra?: ReactNode;
  load?: ClientLoader;
}

/**
 * The email + password form of `/sign-up` and `/log-in` (PLT-010 AC 2–9). Client checks
 * run on submit (nothing is sent when they fail, focus moves to the first invalid
 * field); while sending, the button is disabled and shows the progress label; server
 * errors use kind copy from `AUTH_ERROR_MESSAGES`. Offline, the submit is disabled.
 */
export function EmailAuthForm({
  mode,
  next,
  onSignedIn,
  onConfirmEmail,
  extra,
  load,
}: EmailAuthFormProps) {
  const online = useOnlineStatus();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email: FieldError | null;
    password: FieldError | null;
  }>({ email: null, password: null });
  const [serverError, setServerError] = useState<AuthErrorCode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const sending = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const signUp = mode === "sign-up";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current || !online) return;
    const errors = validateCredentials({ email, password }, mode);
    setFieldErrors(errors);
    setServerError(null);
    if (errors.email) {
      emailRef.current?.focus();
      return;
    }
    if (errors.password) {
      passwordRef.current?.focus();
      return;
    }
    sending.current = true;
    setSubmitting(true);
    const loader = load ? { load } : {};
    const outcome = signUp
      ? await signUpWithEmail({ email, password }, { next, ...loader })
      : await logInWithEmail({ email, password }, loader);
    if (outcome.kind === "signed-in") {
      // Stays "submitting" while the caller finishes and navigates away.
      await onSignedIn(outcome.session);
      return;
    }
    sending.current = false;
    setSubmitting(false);
    if (outcome.kind === "confirm-email") {
      onConfirmEmail?.(email.trim());
      return;
    }
    setServerError(outcome.code);
  }

  const submitLabel = signUp
    ? submitting
      ? AUTH_COPY.creatingAccount
      : AUTH_COPY.createAccount
    : submitting
      ? AUTH_COPY.loggingIn
      : AUTH_COPY.logIn;

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
      {!online && (
        <p
          role="status"
          className="rounded-control border-2 border-border bg-surface-raised px-3 py-2 font-medium"
        >
          {AUTH_COPY.offline}
        </p>
      )}
      <TextField
        name="email"
        label={AUTH_COPY.email}
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        inputRef={emailRef}
        error={fieldErrors.email ? FIELD_MESSAGES[fieldErrors.email] : null}
      />
      <PasswordField
        name="password"
        value={password}
        onChange={setPassword}
        autoComplete={signUp ? "new-password" : "current-password"}
        inputRef={passwordRef}
        hint={signUp ? AUTH_COPY.passwordHint : undefined}
        error={fieldErrors.password ? FIELD_MESSAGES[fieldErrors.password] : null}
      />
      {extra}
      {serverError && (
        <div
          role="alert"
          className="flex flex-col gap-1 rounded-control border-2 border-danger-border bg-danger-tint px-3 py-2 font-medium text-danger-fg"
        >
          <p>{AUTH_ERROR_MESSAGES[serverError]}</p>
          {serverError === "email_taken" && signUp && (
            <Link href={logInHref(next)} className={LINK_CLASSES}>
              {AUTH_COPY.logInInstead}
            </Link>
          )}
        </div>
      )}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={submitting || !online}
        aria-disabled={submitting || !online ? true : undefined}
      >
        {submitLabel}
      </Button>
    </form>
  );
}

/** `/log-in`, keeping a same-origin `next`. */
export function logInHref(next?: string | null): string {
  return next ? `/log-in?next=${encodeURIComponent(next)}` : "/log-in";
}

/** `/sign-up`, keeping a same-origin `next`. */
export function signUpHref(next?: string | null): string {
  return next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up";
}
