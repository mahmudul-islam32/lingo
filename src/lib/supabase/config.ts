/**
 * Accounts flags (ADR-020 §1–2). Read with plain `process.env.NEXT_PUBLIC_*` member
 * expressions so Next inlines them at build time: with both Supabase variables unset the
 * flag is a constant `false` in the bundle, no auth UI renders and no request leaves for
 * Supabase. Functions (not constants) so unit tests can stub the environment.
 */

/** Public Supabase project URL, or `null` when accounts are disabled. */
export function supabaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || null;
}

/** Public anon / publishable key, or `null` when accounts are disabled. Never a service key. */
export function supabaseAnonKey(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
}

/** `ACCOUNTS_ENABLED`: both public Supabase variables are set (ADR-020 §1). */
export function accountsEnabled(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

/** Google button (PLT-011): its own flag, and only with accounts enabled (ADR-020 §2). */
export function googleAuthEnabled(): boolean {
  return accountsEnabled() && process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
}
