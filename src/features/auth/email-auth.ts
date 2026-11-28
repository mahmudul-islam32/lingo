/**
 * Email and password sign-up / log-in through the one Supabase client (PLT-010). Every
 * failure is an `AuthErrorCode` (ADR-020 §4); the raw server text never reaches the UI.
 */
import type { Session } from "@supabase/supabase-js";
import { safeNextPath, type AuthErrorCode } from "@/contracts";
import { getSupabaseClient, type SupabaseClient } from "@/lib/supabase";
import { mapAuthError } from "./errors";

export type ClientLoader = () => Promise<SupabaseClient | null>;

export type SignUpOutcome =
  | { kind: "signed-in"; session: Session }
  /** Email confirmation is on (PD-087): no session until the link is opened. */
  | { kind: "confirm-email" }
  | { kind: "error"; code: AuthErrorCode };

export type LogInOutcome =
  { kind: "signed-in"; session: Session } | { kind: "error"; code: AuthErrorCode };

export interface Credentials {
  email: string;
  password: string;
}

/** Path of the route that finishes every link from Supabase Auth (ADR-020 §3). */
export const AUTH_CALLBACK_PATH = "/auth/callback";

/** `<origin>/auth/callback`, with `next` only when it is a same-origin path. */
export function callbackUrl(origin: string, next?: string | null): string {
  const safe = safeNextPath(next);
  const query = safe === "/" ? "" : `?next=${encodeURIComponent(safe)}`;
  return `${origin}${AUTH_CALLBACK_PATH}${query}`;
}

function currentOrigin(): string {
  return typeof window === "undefined" ? "" : window.location.origin;
}

async function requireClient(load: ClientLoader): Promise<SupabaseClient> {
  const client = await load();
  if (!client) throw Object.assign(new Error("accounts are disabled"), { code: "unknown" });
  return client;
}

export async function signUpWithEmail(
  { email, password }: Credentials,
  options: { next?: string | null; load?: ClientLoader } = {},
): Promise<SignUpOutcome> {
  try {
    const client = await requireClient(options.load ?? getSupabaseClient);
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: callbackUrl(currentOrigin(), options.next) },
    });
    if (error) return { kind: "error", code: mapAuthError(error) };
    if (data.session) return { kind: "signed-in", session: data.session };
    // With confirmation on, Supabase answers an existing email with a user that has no
    // identities (and sends no mail); that is the only hint it gives.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { kind: "error", code: "email_taken" };
    }
    return { kind: "confirm-email" };
  } catch (error) {
    return { kind: "error", code: mapAuthError(error) };
  }
}

export async function logInWithEmail(
  { email, password }: Credentials,
  options: { load?: ClientLoader } = {},
): Promise<LogInOutcome> {
  try {
    const client = await requireClient(options.load ?? getSupabaseClient);
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !data.session) {
      return { kind: "error", code: error ? mapAuthError(error) : "unknown" };
    }
    return { kind: "signed-in", session: data.session };
  } catch (error) {
    return { kind: "error", code: mapAuthError(error) };
  }
}

/** Exchanges the `code` of a confirmation / OAuth / recovery link (ADR-020 §3). */
export async function exchangeCode(
  code: string,
  options: { load?: ClientLoader } = {},
): Promise<LogInOutcome> {
  try {
    const client = await requireClient(options.load ?? getSupabaseClient);
    const { data, error } = await client.auth.exchangeCodeForSession(code);
    if (error || !data.session) {
      return { kind: "error", code: error ? mapAuthError(error) : "link_expired" };
    }
    return { kind: "signed-in", session: data.session };
  } catch (error) {
    return { kind: "error", code: mapAuthError(error) };
  }
}
