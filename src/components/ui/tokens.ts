/**
 * Design tokens needed in TypeScript (e.g. the web app manifest, `<meta name="theme-color">`).
 * The CSS custom properties in `tokens.css` are the source of truth for styling;
 * `tokens.test.ts` checks that these values match it.
 */
export const BRAND_HEX = {
  /** Midnight indigo: dark-theme canvas, manifest `theme_color` / `background_color`. */
  night950: "#0f0e2a",
  night900: "#1e1c4c",
  /** Amber/gold glow. */
  glow400: "#ffb820",
  /** Dark-theme canvas (default). */
  canvasDark: "#0f0e2a",
  /** Light-theme warm off-white canvas. */
  canvasLight: "#fbf7f0",
} as const;

/** Themes supported by the tokens. Dark is the default (ADR-004). */
export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];
