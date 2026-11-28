/**
 * The one browser Supabase client (ADR-020 §1). Created lazily through `import()` behind
 * the accounts flag, so `@supabase/supabase-js` is never loaded by a guest-only build and
 * a disabled build makes zero requests. No server client, no SSR auth: the session lives
 * in `localStorage`.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { accountsEnabled, supabaseAnonKey, supabaseUrl } from "./config";

export type { SupabaseClient };

/** `localStorage` key of the session (stable, so tests and log-out can find it). */
export const AUTH_STORAGE_KEY = "polyglow-auth";

let shared: Promise<SupabaseClient | null> | null = null;

async function create(): Promise<SupabaseClient | null> {
  // The condition is written out with the `process.env.NEXT_PUBLIC_*` literals on purpose:
  // in a guest-only build Next inlines them as "", webpack drops this branch and never
  // emits the supabase-js chunk (ADR-020 §1: not in any guest bundle or precache).
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const url = supabaseUrl();
    const key = supabaseAnonKey();
    if (!url || !key || typeof window === "undefined") return null;
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(url, key, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        // `/auth/callback` exchanges the code itself (ADR-020 §3).
        detectSessionInUrl: false,
        storageKey: AUTH_STORAGE_KEY,
      },
    });
  }
  return null;
}

/**
 * The app-wide client, or `null` when accounts are disabled (or on the server). Never
 * throws for a disabled build; the import is only started when the flag is on.
 */
export function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!accountsEnabled()) return Promise.resolve(null);
  shared ??= create().catch((error: unknown) => {
    shared = null;
    throw error;
  });
  return shared;
}

/** Tests only: replace (or with `null`, forget) the shared client. */
export function setSupabaseClientForTests(client: SupabaseClient | null): void {
  shared = client ? Promise.resolve(client) : null;
}
