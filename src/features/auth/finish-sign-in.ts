/**
 * The one path every successful sign-in goes through (PLT-010 criterion 11): email
 * sign-up, log-in and `/auth/callback` (confirmation, Google). PLT-010 stores the session;
 * the guest → account switch and migration are added by PLT-013.
 */
import type { Session } from "@supabase/supabase-js";
import type { StoreApi } from "zustand";
import { sessionStore, type SessionState } from "./session-store";

export type SignInMethod = "sign-up" | "log-in";

export interface FinishSignInOptions {
  method: SignInMethod;
  store?: StoreApi<SessionState>;
}

export async function finishSignIn(session: Session, options: FinishSignInOptions): Promise<void> {
  (options.store ?? sessionStore).getState().setSession(session);
}
