"use client";

import { useEffect } from "react";
import type { StoreApi } from "zustand";
import { guestProfileStore, type GuestProfileState } from "./guest-profile-store";
import { StorageUnavailableNotice } from "./StorageUnavailableNotice";

/**
 * Creates or loads the on-device learner profile on first render (client only) and
 * renders the "can't save" notice when storage is in memory. Mounted once by the root
 * layout; PLT-001 may move the notice into its shell slot.
 */
export function GuestProfileBootstrap({
  store = guestProfileStore,
}: {
  store?: StoreApi<GuestProfileState>;
}) {
  useEffect(() => {
    void store.getState().init();
  }, [store]);
  return <StorageUnavailableNotice store={store} />;
}
