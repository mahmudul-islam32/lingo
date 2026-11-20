import type { Theme } from "@/components/ui";

/**
 * The app's only theme (PD-066, ADR-014: light, design v2). Set on `<html data-theme>` by
 * the root layout; there is no theme switch and no dark mode for now.
 */
export const DEFAULT_THEME: Theme = "light";
