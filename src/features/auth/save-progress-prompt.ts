/**
 * "Save your progress" prompt rules (PLT-013 criteria 1–2, PD-087 #6): after a guest's 1st
 * and 5th finished lesson, then never by itself again (Profile keeps the entry, PLT-016).
 * Never during a lesson (it opens on Learn after "Continue"), offline, for an account or
 * with accounts disabled. Which thresholds were shown is stored on the device.
 */
import { createStore, useStore, type StoreApi } from "zustand";
import { getLocalSession } from "@/lib/offline";
import { accountsEnabled } from "@/lib/supabase";
import { sessionStore } from "./session-store";

export const SAVE_PROGRESS_THRESHOLDS = [1, 5] as const;
export const SAVE_PROMPT_KEY = "polyglow.saveProgressPrompt";

/**
 * The threshold to prompt for, or `null`: the highest threshold reached that was not shown
 * yet. A long-time guest who reached both at once sees the prompt once. Pure.
 */
export function promptThreshold(lessonCount: number, shown: readonly number[]): number | null {
  const due = SAVE_PROGRESS_THRESHOLDS.filter((t) => lessonCount >= t && !shown.includes(t));
  return due.length > 0 ? due[due.length - 1]! : null;
}

export function readShownThresholds(): number[] {
  try {
    const raw = window.localStorage.getItem(SAVE_PROMPT_KEY);
    const value = raw ? (JSON.parse(raw) as { shown?: unknown }) : null;
    return Array.isArray(value?.shown) ? value.shown.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

function writeShownThresholds(shown: number[]): void {
  try {
    window.localStorage.setItem(SAVE_PROMPT_KEY, JSON.stringify({ shown }));
  } catch {
    // Storage unavailable: the prompt may show again; nothing else depends on it.
  }
}

interface PromptState {
  open: boolean;
}

export const saveProgressPromptStore: StoreApi<PromptState> = createStore<PromptState>()(() => ({
  open: false,
}));

export function useSaveProgressPromptOpen(): boolean {
  return useStore(saveProgressPromptStore, (s) => s.open);
}

export function closeSaveProgressPrompt(): void {
  saveProgressPromptStore.setState({ open: false });
}

export interface OfferDeps {
  enabled: () => boolean;
  online: () => boolean;
  /** Finished lessons (review sessions excluded) and whether the device is a guest. */
  readDevice: () => Promise<{ guest: boolean; lessonCount: number }>;
  signedIn: () => boolean;
}

const defaultOfferDeps: OfferDeps = {
  enabled: accountsEnabled,
  online: () => typeof navigator === "undefined" || navigator.onLine,
  readDevice: async () => {
    const local = await getLocalSession();
    const identity = await local.profile.getIdentity();
    const results = await local.account.listAllLessonResults();
    return {
      guest: identity.kind === "guest",
      lessonCount: results.filter((r) => r.kind !== "review").length,
    };
  },
  signedIn: () => sessionStore.getState().status !== "signed-out",
};

/**
 * Called by the lesson route on the results screen's "Continue", before it goes to Learn.
 * Marks the prompt to open there when a threshold is due. Never throws.
 */
export async function offerSaveProgress(deps: OfferDeps = defaultOfferDeps): Promise<boolean> {
  try {
    if (!deps.enabled() || !deps.online() || deps.signedIn()) return false;
    const { guest, lessonCount } = await deps.readDevice();
    if (!guest) return false;
    const shown = readShownThresholds();
    const threshold = promptThreshold(lessonCount, shown);
    if (threshold === null) return false;
    const reached = SAVE_PROGRESS_THRESHOLDS.filter((t) => t <= threshold);
    writeShownThresholds([...new Set([...shown, ...reached])]);
    saveProgressPromptStore.setState({ open: true });
    return true;
  } catch {
    return false;
  }
}
