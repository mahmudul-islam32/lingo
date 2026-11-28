/**
 * Helpers for the `accounts` project (CTO-025, ADR-020 §9). Talks to the LOCAL Supabase
 * stack only: the defaults are the `supabase start` ports, and the service-role key is
 * read from the environment (CI exports the local stack's demo key; never a hosted key).
 */
import { randomUUID } from "node:crypto";

export const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
export const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const MAIL_URL = process.env.SUPABASE_MAIL_URL ?? "http://127.0.0.1:54324";

if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(SUPABASE_URL)) {
  throw new Error(`accounts tests only run against a local Supabase, not ${SUPABASE_URL}`);
}

/** `null` when the local stack is up and the anon key is known, else why not. */
export async function localStackProblem(): Promise<string | null> {
  if (!ANON_KEY) {
    return "SUPABASE_ANON_KEY is not set. Run `supabase start`, then export the anon key it prints (docs/architecture/local-supabase.md).";
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, { headers: { apikey: ANON_KEY } });
    if (!res.ok) return `Local Supabase Auth answered ${res.status} at ${SUPABASE_URL}.`;
    return null;
  } catch {
    return `Local Supabase is not running at ${SUPABASE_URL}. Run \`supabase start\` (needs Docker), see docs/architecture/local-supabase.md.`;
  }
}

export const uniqueEmail = (tag: string) => `${tag}-${randomUUID().slice(0, 8)}@example.com`;
export const PASSWORD = "correct-horse-42";

export async function authFetch(path: string, init: RequestInit & { token?: string } = {}) {
  const { token, headers, ...rest } = init;
  return fetch(`${SUPABASE_URL}${path}`, {
    ...rest,
    headers: {
      apikey: ANON_KEY,
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
}

/** Creates a confirmed user with the local service-role key (admin API, local only). */
export async function createConfirmedUser(email: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, password: PASSWORD, email_confirm: true }),
  });
  if (!res.ok) throw new Error(`admin create user: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { id: string }).id;
}

export async function signIn(email: string): Promise<string> {
  const res = await authFetch("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`sign in: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

/** Messages to `email` in the local mail UI (Mailpit, or Inbucket on older CLIs). */
export async function mailsTo(email: string): Promise<{ subject: string }[]> {
  try {
    const res = await fetch(
      `${MAIL_URL}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`,
    );
    if (res.ok) {
      const body = (await res.json()) as { messages?: { Subject: string }[] };
      if (body.messages) return body.messages.map((m) => ({ subject: m.Subject }));
    }
  } catch {
    // fall through to Inbucket
  }
  const res = await fetch(`${MAIL_URL}/api/v1/mailbox/${encodeURIComponent(email.split("@")[0]!)}`);
  if (!res.ok) return [];
  return ((await res.json()) as { subject: string }[]).map((m) => ({ subject: m.subject }));
}
