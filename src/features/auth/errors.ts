/**
 * Maps a Supabase Auth error to an `AuthErrorCode` (ADR-020 §4). The UI shows one message
 * per code and never the server text. Unknown errors are logged without personal data.
 */
import type { AuthErrorCode } from "@/contracts";

interface ErrorLike {
  name?: unknown;
  code?: unknown;
  status?: unknown;
  message?: unknown;
}

const BY_CODE: Record<string, AuthErrorCode> = {
  invalid_credentials: "invalid_credentials",
  user_not_found: "invalid_credentials",
  email_not_confirmed: "email_not_confirmed",
  user_already_exists: "email_taken",
  email_exists: "email_taken",
  weak_password: "weak_password",
  over_request_rate_limit: "rate_limited",
  over_email_send_rate_limit: "rate_limited",
  provider_disabled: "provider_disabled",
  oauth_provider_not_supported: "provider_disabled",
  otp_expired: "link_expired",
  flow_state_expired: "link_expired",
  flow_state_not_found: "link_expired",
  bad_code_verifier: "link_expired",
  refresh_token_not_found: "session_expired",
  refresh_token_already_used: "session_expired",
  session_not_found: "session_expired",
  session_expired: "session_expired",
};

function asErrorLike(error: unknown): ErrorLike | null {
  return typeof error === "object" && error !== null ? (error as ErrorLike) : null;
}

/** True for a failed `fetch` (offline, DNS, CORS) as opposed to an answer from the server. */
export function isNetworkError(error: unknown): boolean {
  const e = asErrorLike(error);
  if (!e) return false;
  if (e.name === "AuthRetryableFetchError") return true;
  if (e.name === "TypeError" && typeof e.message === "string") return true;
  // supabase-js reports a fetch failure with status 0.
  return e.status === 0;
}

export function mapAuthError(error: unknown): AuthErrorCode {
  const e = asErrorLike(error);
  if (!e) return "unknown";
  if (typeof e.code === "string" && e.code in BY_CODE) return BY_CODE[e.code]!;
  if (e.name === "AuthWeakPasswordError") return "weak_password";
  if (e.name === "AuthPKCECodeVerifierMissingError") return "link_expired";
  if (e.name === "AuthPKCEGrantCodeExchangeError") return "link_expired";
  if (isNetworkError(error)) return "network";
  if (e.status === 429) return "rate_limited";
  if (e.name === "AuthSessionMissingError") return "session_expired";
  if (e.code === "validation_failed" && typeof e.message === "string") {
    if (/password/i.test(e.message)) return "weak_password";
  }
  // Logged with the code only: never the email, token or server text.
  console.warn("[auth] unmapped error", { name: e.name, code: e.code, status: e.status });
  return "unknown";
}
