"use client";

import { useEffect } from "react";
import type { StoreApi } from "zustand";
import { sessionStore, type SessionState } from "./session-store";

/**
 * Reads the stored session once per tab (PLT-010 criterion 10). Mounted by the root layout.
 * With accounts disabled it only marks the store ready: supabase-js is never loaded.
 */
export function SessionBootstrap({ store = sessionStore }: { store?: StoreApi<SessionState> }) {
  useEffect(() => {
    void store.getState().init();
  }, [store]);
  return null;
}
