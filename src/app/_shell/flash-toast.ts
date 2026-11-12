"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui";

/** sessionStorage key of the one-shot toast for the next screen. */
export const FLASH_TOAST_KEY = "polyglow:flash-toast";

/**
 * Queues a toast for the screen we're about to navigate to (PLT-009 AC 4). A
 * `router.replace` can turn into a full page load (offline, when the target's RSC payload
 * isn't cached, Next falls back to a document navigation that the service worker serves),
 * which would drop an in-memory toast. sessionStorage survives it. If storage is
 * unavailable, the toast is shown right away instead (fine for client-side navigation).
 */
export function queueFlashToast(title: string, fallbackShow: (title: string) => void): void {
  try {
    window.sessionStorage.setItem(FLASH_TOAST_KEY, title);
  } catch {
    fallbackShow(title);
  }
}

/** Shows (once) the toast queued by `queueFlashToast` for this screen. */
export function useFlashToast(): void {
  const toast = useToast();
  useEffect(() => {
    let title: string | null = null;
    try {
      title = window.sessionStorage.getItem(FLASH_TOAST_KEY);
      if (title !== null) window.sessionStorage.removeItem(FLASH_TOAST_KEY);
    } catch {
      return;
    }
    if (title) toast.show({ title });
  }, [toast]);
}
