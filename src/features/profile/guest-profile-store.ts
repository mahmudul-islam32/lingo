/**
 * Client state for the learner on this device: identity, profile, settings and
 * whether storage is persistent. Backed by `@/lib/offline` (never Dexie directly).
 */
import { createStore, useStore, type StoreApi } from "zustand";
import type { Identity, Profile, Settings } from "@/contracts";
import {
  getLocalSession,
  type LocalSession,
  type SettingsPatch,
  type StorageInfo,
} from "@/lib/offline";

export type GuestProfileStatus = "idle" | "loading" | "ready" | "error";

export interface GuestProfileState {
  status: GuestProfileStatus;
  identity: Identity | null;
  profile: Profile | null;
  /** `null` until onboarding chose a course and a daily goal. */
  settings: Settings | null;
  /** True once `profile.onboardedAt` is set. */
  onboardingComplete: boolean;
  storage: StorageInfo | null;
  /** The learner closed the "can't save" notice for this session. */
  storageNoticeDismissed: boolean;
  error: Error | null;

  /** Opens storage and creates the guest on first launch. Safe to call more than once. */
  init(): Promise<void>;
  /** Validates and saves; rejects with a typed `LocalDataError` (nothing is stored). */
  updateSettings(patch: SettingsPatch): Promise<Settings>;
  completeOnboarding(): Promise<Profile>;
  dismissStorageNotice(): void;
}

export interface GuestProfileStoreDeps {
  loadSession: () => Promise<LocalSession>;
}

const initialData = {
  status: "idle" as GuestProfileStatus,
  identity: null,
  profile: null,
  settings: null,
  onboardingComplete: false,
  storage: null,
  storageNoticeDismissed: false,
  error: null,
};

export function createGuestProfileStore(
  deps: GuestProfileStoreDeps = { loadSession: getLocalSession },
): StoreApi<GuestProfileState> {
  let initPromise: Promise<void> | null = null;

  return createStore<GuestProfileState>()((set, get) => ({
    ...initialData,

    init: () => {
      initPromise ??= (async () => {
        set({ status: "loading", error: null });
        try {
          const session = await deps.loadSession();
          const { identity, profile, settings } = await session.profile.bootstrap();
          set({
            status: "ready",
            identity,
            profile,
            settings,
            onboardingComplete: profile.onboardedAt !== null,
            storage: session.storage,
          });
        } catch (error) {
          initPromise = null; // allow a retry
          set({
            status: "error",
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      })();
      return initPromise;
    },

    updateSettings: async (patch) => {
      const session = await deps.loadSession();
      const settings = await session.profile.updateSettings(patch);
      set({ settings });
      return settings;
    },

    completeOnboarding: async () => {
      const session = await deps.loadSession();
      const profile = await session.profile.completeOnboarding();
      set({ profile, onboardingComplete: profile.onboardedAt !== null });
      return profile;
    },

    dismissStorageNotice: () => {
      if (!get().storageNoticeDismissed) set({ storageNoticeDismissed: true });
    },
  }));
}

/** App-wide store instance. */
export const guestProfileStore = createGuestProfileStore();

/** React hook over the app-wide store, e.g. `useGuestProfile((s) => s.settings)`. */
export function useGuestProfile<T>(selector: (state: GuestProfileState) => T): T {
  return useStore(guestProfileStore, selector);
}

/** True when progress is kept in memory only and the "can't save" notice should show. */
export const selectShowStorageNotice = (state: GuestProfileState): boolean =>
  state.storage !== null && !state.storage.persistent && !state.storageNoticeDismissed;
