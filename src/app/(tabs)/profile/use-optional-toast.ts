"use client";

import { useToast, type ToastApi } from "@/components/ui";

/**
 * `useToast()`, or `null` outside a `ToastProvider` (the app always has one; some screen
 * tests render Profile without it). `useContext` runs on every render either way, so the
 * hook order never changes.
 */
export function useOptionalToast(): ToastApi | null {
  try {
    return useToast();
  } catch {
    return null;
  }
}
