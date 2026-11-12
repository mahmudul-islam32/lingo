import { createStore, type StoreApi } from "zustand";
import {
  isIosDevice,
  isStandaloneDisplay,
  readInstallDismissedAt,
  writeInstallDismissedAt,
} from "@/lib/offline";

/**
 * `beforeinstallprompt` is Chromium-only and not in TypeScript's DOM lib, so it is typed
 * locally (PLT-005 technical notes).
 */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms?: readonly string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
  prompt(): Promise<void>;
}

export interface InstallPromptState {
  /** `init()` ran in the browser; until then the card renders nothing (no SSR mismatch). */
  ready: boolean;
  /** The deferred event; usable once, so it is cleared when the native prompt opens. */
  promptEvent: BeforeInstallPromptEvent | null;
  dismissedAt: string | null;
  isStandalone: boolean;
  isIos: boolean;

  /** Starts listening (idempotent). Call as early as possible: the event fires once per load. */
  init(): void;
  /** "Not now", "Got it", or the native prompt was dismissed or failed (criteria 4, 6). */
  dismiss(now?: number): void;
  /** Opens the native prompt (criterion 3). Resolves with the learner's choice. */
  install(now?: number): Promise<"accepted" | "dismissed">;
}

export interface InstallPromptEnv {
  window: Window;
  storage?: Storage;
}

function browserEnv(): InstallPromptEnv {
  let storage: Storage | undefined;
  try {
    storage = window.localStorage;
  } catch {
    storage = undefined;
  }
  return { window, storage };
}

/** Creates the store. Tests pass their own environment; the app uses the singleton below. */
export function createInstallPromptStore(
  getEnv: () => InstallPromptEnv = browserEnv,
): StoreApi<InstallPromptState> {
  let env: InstallPromptEnv | null = null;

  return createStore<InstallPromptState>()((set, get) => ({
    ready: false,
    promptEvent: null,
    dismissedAt: null,
    isStandalone: false,
    isIos: false,

    init() {
      if (env) return;
      env = getEnv();
      const win = env.window;
      const standalone = () =>
        isStandaloneDisplay(win.matchMedia ? (q) => win.matchMedia(q) : undefined, win.navigator);

      win.addEventListener("beforeinstallprompt", (event) => {
        // Criterion 1: no browser mini-infobar; keep the event for our own card.
        event.preventDefault();
        set({ promptEvent: event as BeforeInstallPromptEvent });
      });
      win.addEventListener("appinstalled", () => {
        set({ promptEvent: null, isStandalone: standalone() });
      });

      set({
        ready: true,
        dismissedAt: readInstallDismissedAt(env.storage),
        isStandalone: standalone(),
        isIos: isIosDevice(win.navigator),
      });
    },

    dismiss(now = Date.now()) {
      set({ dismissedAt: writeInstallDismissedAt(env?.storage, now) });
    },

    async install(now = Date.now()) {
      const event = get().promptEvent;
      if (!event) return "dismissed";
      // The event can only be prompted once.
      set({ promptEvent: null });
      try {
        await event.prompt();
        const choice = await event.userChoice;
        if (choice.outcome === "accepted") return "accepted";
      } catch {
        // UX notes: a failing native prompt just hides the card for 7 days, no message.
      }
      get().dismiss(now);
      return "dismissed";
    },
  }));
}

/** App-wide store; the root layout's `InstallPromptCapture` calls `init()` on mount. */
export const installPromptStore = createInstallPromptStore();
