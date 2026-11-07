"use client";

import type { StoreApi } from "zustand";
import { useStore } from "zustand";
import {
  guestProfileStore,
  selectShowStorageNotice,
  type GuestProfileState,
} from "./guest-profile-store";

export const STORAGE_NOTICE_TEXT =
  "Progress can't be saved in this browser mode. You can still learn, but it will be lost when you close the tab.";

/** Non-blocking notice shown when storage fell back to memory (PLT-003 UX notes). */
export function StorageUnavailableNotice({
  store = guestProfileStore,
}: {
  store?: StoreApi<GuestProfileState>;
}) {
  const show = useStore(store, selectShowStorageNotice);
  const dismiss = useStore(store, (s) => s.dismissStorageNotice);
  if (!show) return null;
  return (
    <div
      role="status"
      className="flex items-start gap-3 border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <p className="flex-1">{STORAGE_NOTICE_TEXT}</p>
      <button
        type="button"
        onClick={dismiss}
        className="min-h-11 shrink-0 rounded-md px-3 font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900"
      >
        Dismiss
      </button>
    </div>
  );
}
