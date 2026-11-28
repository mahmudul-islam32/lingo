/**
 * Test helpers: a fake Supabase client with only the auth methods the app calls. Every
 * method is a `vi.fn`, so tests set answers with `mockResolvedValue`. Never used by app code.
 */
import { vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import type { SupabaseClient } from "./client";

export type AuthListener = (event: string, session: Session | null) => void;

export function fakeSession(
  overrides: { id?: string; email?: string; accessToken?: string } = {},
): Session {
  const id = overrides.id ?? "7f3c2a9e-1b4d-4c6e-8f0a-2d5b7e9c1a3f";
  return {
    access_token: overrides.accessToken ?? "access-token",
    refresh_token: "refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {
      id,
      email: overrides.email ?? "learner@example.com",
      aud: "authenticated",
      app_metadata: {},
      user_metadata: {},
      created_at: "2026-11-28T00:00:00Z",
    },
  } as Session;
}

export function createFakeAuthClient() {
  const listeners: AuthListener[] = [];
  const auth = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    exchangeCodeForSession: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    getSession: vi.fn(async () => ({ data: { session: null as Session | null }, error: null })),
    signOut: vi.fn(async () => ({ error: null })),
    onAuthStateChange: vi.fn((listener: AuthListener) => {
      listeners.push(listener);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
  };
  const client = { auth } as unknown as SupabaseClient;
  return {
    client,
    auth,
    load: async () => client,
    emit: (event: string, session: Session | null) => listeners.forEach((l) => l(event, session)),
  };
}
