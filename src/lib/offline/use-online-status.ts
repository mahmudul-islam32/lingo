"use client";

import { useSyncExternalStore } from "react";

/**
 * Connectivity as reported by the browser (`navigator.onLine` plus the `online` /
 * `offline` window events). PLT-006.
 *
 * `navigator.onLine === false` reliably means "no network"; `true` only means "some
 * network interface is up", so callers must still handle failed requests. Sync status
 * (PLT-014) is deliberately not part of this hook.
 */
function subscribe(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

/** The server can't know; assume online so the offline banner never flashes on SSR. */
function getServerSnapshot(): boolean {
  return true;
}

/** `true` while the browser reports a network connection; re-renders on changes. */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
