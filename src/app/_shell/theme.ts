import type { Theme } from "@/components/ui";

/**
 * Default theme (ADR-004: dark-first, midnight indigo). Set on `<html data-theme>` by the
 * root layout so the first paint is correct; `useTheme()` in `providers.tsx` can switch it.
 */
export const DEFAULT_THEME: Theme = "dark";
