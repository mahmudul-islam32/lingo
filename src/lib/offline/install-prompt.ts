/**
 * Install-prompt rules (PLT-005). Pure functions plus a tiny `localStorage` wrapper; the
 * UI lives in `src/app/_shell/InstallCard.tsx`. The dismissal time is a device UI
 * preference, not synced user data, so it is stored on the device only.
 */

/** `localStorage` key holding the last dismissal as an ISO string (PLT-005 notes). */
export const INSTALL_DISMISSED_KEY = "polyglow.installPromptDismissedAt";

/** "Not now" hides the card for seven days (criterion 4), compared on instants. */
export const INSTALL_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

export type InstallCardMode = "prompt" | "ios-steps" | "hidden";

export interface InstallCardInput {
  /** Current instant in ms since the epoch (injected so tests control time). */
  now: number;
  /** Last dismissal as an ISO string, or `null` when never dismissed. */
  dismissedAt: string | null;
  isStandalone: boolean;
  onboarded: boolean;
  onLearnTab: boolean;
  /** A deferred `beforeinstallprompt` event is available. */
  hasPromptEvent: boolean;
  isIos: boolean;
}

/** `true` while a dismissal at `dismissedAt` still hides the card at `now`. */
export function isDismissalActive(dismissedAt: string | null, now: number): boolean {
  if (!dismissedAt) return false;
  const at = Date.parse(dismissedAt);
  // An unreadable value must not hide the card forever.
  if (Number.isNaN(at)) return false;
  return now - at < INSTALL_DISMISS_MS;
}

/**
 * Which install card to show (criteria 2, 4, 5, 6). Installed apps and learners who are
 * not on the Learn tab after onboarding never see it; a recent dismissal hides both the
 * native-prompt card and the iOS steps.
 */
export function shouldShowInstallCard(input: InstallCardInput): InstallCardMode {
  if (input.isStandalone) return "hidden";
  if (!input.onboarded || !input.onLearnTab) return "hidden";
  if (isDismissalActive(input.dismissedAt, input.now)) return "hidden";
  if (input.hasPromptEvent) return "prompt";
  if (input.isIos) return "ios-steps";
  return "hidden";
}

export type MatchMediaLike = (query: string) => { matches: boolean };

export interface NavigatorLike {
  /** iOS Safari's non-standard "launched from the home screen" flag. */
  standalone?: boolean;
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
}

/** The app already runs installed: `display-mode: standalone` or iOS `navigator.standalone`. */
export function isStandaloneDisplay(
  matchMedia: MatchMediaLike | undefined,
  nav: NavigatorLike | undefined,
): boolean {
  if (nav?.standalone === true) return true;
  try {
    return matchMedia?.("(display-mode: standalone)").matches === true;
  } catch {
    return false;
  }
}

/**
 * iPhone, iPod or iPad (iPadOS reports itself as "MacIntel" with touch). iOS has no
 * `beforeinstallprompt`; installing goes through Share, then Add to Home Screen.
 */
export function isIosDevice(nav: NavigatorLike | undefined): boolean {
  if (!nav) return false;
  if (/iPad|iPhone|iPod/.test(nav.userAgent ?? "")) return true;
  return nav.platform === "MacIntel" && (nav.maxTouchPoints ?? 0) > 1;
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

/** Reads the dismissal time; `null` when unset or when storage is unavailable. */
export function readInstallDismissedAt(storage: StorageLike | undefined): string | null {
  try {
    return storage?.getItem(INSTALL_DISMISSED_KEY) ?? null;
  } catch {
    // Private mode or blocked storage: behave as never dismissed.
    return null;
  }
}

/** Stores the dismissal time and returns it (the in-memory value still applies if storage fails). */
export function writeInstallDismissedAt(storage: StorageLike | undefined, now: number): string {
  const iso = new Date(now).toISOString();
  try {
    storage?.setItem(INSTALL_DISMISSED_KEY, iso);
  } catch {
    // Storage full or blocked: the card stays hidden for this session only.
  }
  return iso;
}
