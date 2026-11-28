/**
 * Reads auth mails from the LOCAL stack's mail UI (Mailpit, or Inbucket on older CLIs) and
 * returns the first Supabase Auth link in them (PLT-010, PLT-012). Local stack only.
 */
import { expect } from "@playwright/test";
import { MAIL_URL } from "../local-supabase";

interface MailBody {
  html: string;
  text: string;
}

async function mailpitBodies(email: string): Promise<MailBody[] | null> {
  try {
    const res = await fetch(
      `${MAIL_URL}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`,
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { messages?: { ID: string }[] };
    if (!body.messages) return null;
    const out: MailBody[] = [];
    for (const m of body.messages) {
      const one = await fetch(`${MAIL_URL}/api/v1/message/${m.ID}`);
      if (!one.ok) continue;
      const json = (await one.json()) as { HTML?: string; Text?: string };
      out.push({ html: json.HTML ?? "", text: json.Text ?? "" });
    }
    return out;
  } catch {
    return null;
  }
}

async function inbucketBodies(email: string): Promise<MailBody[]> {
  const box = encodeURIComponent(email.split("@")[0]!);
  const res = await fetch(`${MAIL_URL}/api/v1/mailbox/${box}`);
  if (!res.ok) return [];
  const list = (await res.json()) as { id: string }[];
  const out: MailBody[] = [];
  for (const m of list) {
    const one = await fetch(`${MAIL_URL}/api/v1/mailbox/${box}/${m.id}`);
    if (!one.ok) continue;
    const json = (await one.json()) as { body?: { html?: string; text?: string } };
    out.push({ html: json.body?.html ?? "", text: json.body?.text ?? "" });
  }
  return out;
}

/** Every `/auth/v1/verify` link in the mails to `email` (any order). */
export async function authLinksTo(email: string): Promise<string[]> {
  const bodies = (await mailpitBodies(email)) ?? (await inbucketBodies(email));
  const links = new Set<string>();
  for (const { html, text } of bodies) {
    const found = `${html}\n${text}`.match(/https?:\/\/[^\s"'<>]+\/auth\/v1\/verify[^\s"'<>]*/g);
    for (const link of found ?? []) links.add(link.replace(/&amp;/g, "&"));
  }
  return [...links];
}

/** Waits for a mail to `email` with an auth link of `type` (`signup`, `recovery`) and returns it. */
export async function waitForAuthLink(
  email: string,
  type: "signup" | "recovery" = "signup",
): Promise<string> {
  // GoTrue names the sign-up confirmation `signup` (older) or `email` (newer).
  const accepted = type === "signup" ? ["signup", "email"] : [type];
  const ofType = async () =>
    (await authLinksTo(email)).filter((link) =>
      accepted.includes(new URL(link).searchParams.get("type") ?? ""),
    );
  await expect.poll(async () => (await ofType()).length, { timeout: 20_000 }).toBeGreaterThan(0);
  return (await ofType())[0]!;
}

/**
 * A confirmed user without any admin key: sign up through the Auth API, then open the
 * confirmation link from the mail UI (local stack only).
 */
export async function createUserByMail(email: string, password: string): Promise<void> {
  const { authFetch } = await import("../local-supabase");
  const res = await authFetch("/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  expect(res.ok, await res.clone().text()).toBe(true);
  const link = await waitForAuthLink(email, "signup");
  const verify = await fetch(link, { redirect: "manual" });
  expect(verify.status, "confirmation link").toBeLessThan(400);
}
