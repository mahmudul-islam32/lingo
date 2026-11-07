"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ToastProvider, type Theme } from "@/components/ui";
import { createQueryClient } from "@/lib/query";
import { DEFAULT_THEME } from "./_shell/theme";

interface ThemeApi {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeApi | null>(null);

export interface ProvidersProps {
  children: ReactNode;
  /** Theme to start with. Default: dark (ADR-004). */
  initialTheme?: Theme;
}

/**
 * App-wide client providers, mounted once by the root layout: the theme (applied as
 * `data-theme` on `<html>`), the TanStack Query client (one per tab, ADR-005) and the
 * toast queue. Toasts sit above the bottom navigation.
 */
export function Providers({ children, initialTheme = DEFAULT_THEME }: ProvidersProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const api = useMemo<ThemeApi>(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext value={api}>
      <ToastProvider viewportClassName="bottom-[calc(env(safe-area-inset-bottom)+5rem)]">
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ToastProvider>
    </ThemeContext>
  );
}

/** Current theme and a setter (for the future settings screen, PLT-016). */
export function useTheme(): ThemeApi {
  const api = useContext(ThemeContext);
  if (!api) throw new Error("useTheme must be used inside <Providers>");
  return api;
}
