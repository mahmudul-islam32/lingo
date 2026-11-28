/**
 * The one path every successful sign-in goes through (PLT-010 criterion 11): email
 * sign-up, log-in and `/auth/callback` (confirmation, Google). It stores the session, then
 * switches the device from guest to account (PLT-013): migrate, adopt or nothing.
 */
import type { Session } from "@supabase/supabase-js";
import type { StoreApi } from "zustand";
import {
  runAccountSwitch,
  type AccountSwitchDeps,
  type AccountSwitchOutcome,
  type SignInMethod,
} from "./account-switch";
import { sessionStore, type SessionState } from "./session-store";

export type { SignInMethod };

export interface FinishSignInOptions {
  method: SignInMethod;
  store?: StoreApi<SessionState>;
  deps?: AccountSwitchDeps;
}

export async function finishSignIn(
  session: Session,
  options: FinishSignInOptions,
): Promise<AccountSwitchOutcome> {
  (options.store ?? sessionStore).getState().setSession(session);
  return runAccountSwitch(session.user.id, options.method, options.deps);
}
