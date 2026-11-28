import { afterEach, describe, expect, it, vi } from "vitest";
import { accountsEnabled, googleAuthEnabled } from "../config";
import { getSupabaseClient } from "../client";

afterEach(() => vi.unstubAllEnvs());

describe("accounts flag (ADR-020 §1–2)", () => {
  it("is off without both public variables", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(accountsEnabled()).toBe(false);
    await expect(getSupabaseClient()).resolves.toBeNull();

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    expect(accountsEnabled()).toBe(false);
  });

  it("is on with both, and Google needs its own flag", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    expect(accountsEnabled()).toBe(true);
    expect(googleAuthEnabled()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_AUTH_GOOGLE_ENABLED", "true");
    expect(googleAuthEnabled()).toBe(true);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(googleAuthEnabled()).toBe(false);
  });
});
