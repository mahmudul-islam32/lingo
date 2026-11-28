/** Client checks of the auth forms (PLT-010 criterion 3). Pure. */

/** The Supabase project minimum (`supabase/config.toml` `minimum_password_length`). */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * A pragmatic email check: one `@`, a non-empty local part, a dotted domain, no spaces.
 * The server is the real judge; this only catches typos before anything is sent.
 */
export function isValidEmail(value: string): boolean {
  const email = value.trim();
  if (email.length === 0 || email.length > 254) return false;
  return /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email);
}

export function isValidPassword(value: string): boolean {
  return value.length >= MIN_PASSWORD_LENGTH;
}

export type FieldError = "invalid_email" | "short_password" | "missing_password";

export interface CredentialErrors {
  email: FieldError | null;
  password: FieldError | null;
}

/**
 * Sign-up checks the password length; log-in only needs a non-empty password (an old
 * password may be shorter than today's minimum).
 */
export function validateCredentials(
  input: { email: string; password: string },
  mode: "sign-up" | "log-in",
): CredentialErrors {
  const email = isValidEmail(input.email) ? null : "invalid_email";
  const password =
    mode === "sign-up"
      ? isValidPassword(input.password)
        ? null
        : "short_password"
      : input.password.length > 0
        ? null
        : "missing_password";
  return { email, password };
}
