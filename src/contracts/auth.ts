/**
 * Accounts (CTO-025, ADR-020): the auth error codes the UI shows copy for, and the one rule
 * for following a `next` parameter after `/auth/callback`. The Supabase client and the
 * screens live in the app (PLT-010 … PLT-012); these contracts keep them consistent.
 */
import { z } from "zod";

/**
 * What went wrong in an auth call, mapped from Supabase Auth errors by the app (ADR-020 §4).
 * The UI has one message per code and never shows the raw server text.
 */
export const AUTH_ERROR_CODES = [
  /** Wrong email or password (also used for an unknown email, so accounts can't be probed). */
  "invalid_credentials",
  /** Signed up but the confirmation link hasn't been opened yet. */
  "email_not_confirmed",
  /** Sign-up with an email that already has an account. */
  "email_taken",
  /** Password shorter than the project minimum (8) or rejected as weak. */
  "weak_password",
  /** Too many attempts or emails; try again later. */
  "rate_limited",
  /** No connection, or the server could not be reached. */
  "network",
  /** The provider (e.g. Google) is not enabled for this build or project. */
  "provider_disabled",
  /** A confirmation or recovery link is invalid or expired. */
  "link_expired",
  /** The session ended (refresh failed); the user signs in again. */
  "session_expired",
  "unknown",
] as const;
export const AuthErrorCodeSchema = z.enum(AUTH_ERROR_CODES);
export type AuthErrorCode = z.infer<typeof AuthErrorCodeSchema>;

/** Where `/auth/callback` goes when `next` is missing or not allowed. */
export const DEFAULT_AUTH_REDIRECT = "/" as const;

/**
 * The `next` parameter of `/auth/callback` is followed only when it is a same-origin path
 * (ADR-020 §3): it starts with a single `/`, is not protocol-relative (`//host`), contains
 * no backslash, scheme or control character, and is at most 512 characters. Anything else
 * returns `DEFAULT_AUTH_REDIRECT`. Pure; the callback route must use it (no open redirect).
 */
export function safeNextPath(next: string | null | undefined): string {
  if (typeof next !== "string" || next.length === 0 || next.length > 512) {
    return DEFAULT_AUTH_REDIRECT;
  }
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return DEFAULT_AUTH_REDIRECT;
  }
  if (/[\\\u0000-\u001f\u007f]/.test(next)) return DEFAULT_AUTH_REDIRECT;
  try {
    const url = new URL(next, "https://polyglow.invalid");
    if (url.origin !== "https://polyglow.invalid") return DEFAULT_AUTH_REDIRECT;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_AUTH_REDIRECT;
  }
}
