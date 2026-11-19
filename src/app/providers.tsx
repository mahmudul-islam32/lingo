"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ToastProvider } from "@/components/ui";
import { createQueryClient } from "@/lib/query";

export interface ProvidersProps {
  children: ReactNode;
}

/**
 * App-wide client providers, mounted once by the root layout: the TanStack Query client
 * (one per tab, ADR-005) and the toast queue. Toasts sit above the bottom navigation.
 * Light theme only (PD-066): the theme is static on `<html data-theme>`, no toggle.
 */
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ToastProvider viewportClassName="bottom-[calc(env(safe-area-inset-bottom)+5.5rem)]">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ToastProvider>
  );
}
