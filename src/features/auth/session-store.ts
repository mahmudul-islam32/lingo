/**
 * The auth session on this device (PLT-010 criterion 10). Backed by the one Supabase
 * client (`@/lib/supabase`); the session itself is persisted and refreshed by supabase-js
 * in `localStorage`. With accounts disabled, `init()` only marks the store ready: no
 * import of supabase-js, no request.
 *
 * `expired` means the device was signed in (or its local identity is an account) and the
 * session ended without the learner logging out: the refresh failed on reconnect, or the
 * sync engine got a 401 after a refresh (PLT-014). Nothing local is lost; the learner logs
 * in again.
 */
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createStore, useStore, type StoreApi } from "zustand";
import { getLocalSession } from "@/lib/offline";
import {
  accountsEnabled,
  AUTH_STORAGE_KEY,
  getSupabaseClient,
  type SupabaseClient,
} from "@/lib/supabase";

export type SessionStatus = "signed-out" | "signed-in" | "expired";

export interface SessionUser {
  id: string;
  /** For display only (PLT-016); never logged. */
  email: string | null;
}

export interface SessionState {
  /** False until the stored session has been read (or accounts are disabled). */
  ready: boolean;
  status: SessionStatus;
  user: SessionUser | null;
  /** Reads the stored session and follows auth events. Idempotent. */
  init(): Promise<void>;
  /** Stores a session that a sign-in just returned (PLT-010 criterion 11). */
  setSession(session: Session): void;
  /** The server refused the session (PLT-014 criterion 5). Keeps local data. */
  markExpired(): void;
  /** Signs out on this device only (PLT-017). Never reported as `expired`. */
  signOutLocal(): Promise<void>;
}

export interface SessionStoreDeps {
  loadClient: () => Promise<SupabaseClient | null>;
  /** True when this device's local identity is an account (an account without a session = expired). */
  isAccountDevice: () => Promise<boolean>;
  enabled: () => boolean;
}

const defaultDeps: SessionStoreDeps = {
  loadClient: getSupabaseClient,
  isAccountDevice: async () => {
    try {
      const session = await getLocalSession();
      return (await session.profile.getIdentity()).kind === "account";
    } catch {
      return false;
    }
  },
  enabled: accountsEnabled,
};

function toUser(session: Session): SessionUser {
  return { id: session.user.id, email: session.user.email ?? null };
}

export function createSessionStore(deps: SessionStoreDeps = defaultDeps): StoreApi<SessionState> {
  let initPromise: Promise<void> | null = null;
  let signingOut = false;

  return createStore<SessionState>()((set, get) => {
    const apply = (event: AuthChangeEvent, session: Session | null, accountDevice: boolean) => {
      if (session) {
        set({ ready: true, status: "signed-in", user: toUser(session) });
        return;
      }
      if (event === "SIGNED_OUT" && signingOut) {
        set({ ready: true, status: "signed-out", user: null });
        return;
      }
      const wasSignedIn = get().status !== "signed-out";
      set({
        ready: true,
        status: wasSignedIn || accountDevice ? "expired" : "signed-out",
        user: wasSignedIn ? get().user : null,
      });
    };

    return {
      ready: false,
      status: "signed-out",
      user: null,

      init: () => {
        initPromise ??= (async () => {
          if (!deps.enabled()) {
            set({ ready: true });
            return;
          }
          try {
            const client = await deps.loadClient();
            if (!client) {
              set({ ready: true });
              return;
            }
            const accountDevice = await deps.isAccountDevice();
            const { data } = await client.auth.getSession();
            apply("INITIAL_SESSION", data.session, accountDevice);
            // Must not await other auth calls inside this callback (supabase-js lock).
            client.auth.onAuthStateChange((event, session) => {
              if (event === "INITIAL_SESSION") return;
              apply(event, session, false);
            });
          } catch {
            // The client couldn't load (e.g. offline cold start without the chunk): guest.
            set({ ready: true });
          }
        })();
        return initPromise;
      },

      setSession: (session) => set({ ready: true, status: "signed-in", user: toUser(session) }),

      markExpired: () => {
        if (get().status === "signed-in") set({ status: "expired" });
      },

      signOutLocal: async () => {
        signingOut = true;
        try {
          const client = await deps.loadClient();
          await client?.auth.signOut({ scope: "local" });
        } catch {
          // Offline or refused: the local copy is removed below anyway.
        } finally {
          // supabase-js keeps the session when the sign-out request fails (offline), so the
          // stored tokens are removed here too (PLT-017 criterion 6: local sign-out offline).
          clearStoredSession();
          set({ ready: true, status: "signed-out", user: null });
          signingOut = false;
        }
      },
    };
  });
}

function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(AUTH_STORAGE_KEY)) window.localStorage.removeItem(key);
    }
  } catch {
    // Storage unavailable: nothing stored.
  }
}

/** App-wide store instance. */
export const sessionStore = createSessionStore();

export interface SessionView {
  ready: boolean;
  status: SessionStatus;
  user: SessionUser | null;
}

/**
 * `signed-out | signed-in | expired` plus the user (PLT-010 criterion 10), for PLT-014 and
 * PLT-016. `ready` is false until the stored session has been read.
 */
export function useSession(store: StoreApi<SessionState> = sessionStore): SessionView {
  const ready = useStore(store, (s) => s.ready);
  const status = useStore(store, (s) => s.status);
  const user = useStore(store, (s) => s.user);
  return { ready, status, user };
}
