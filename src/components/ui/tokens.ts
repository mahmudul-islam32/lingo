/**
 * Design tokens needed in TypeScript (e.g. the web app manifest, `<meta name="theme-color">`).
 * The CSS custom properties in `tokens.css` are the source of truth for styling;
 * `tokens.test.ts` checks that these values match it. Design system v2 (CTO-016, ADR-014).
 */
export const BRAND_HEX = {
  /** v2 primary indigo (`--color-primary`). */
  primary: "#4338ca",
  /** v2 3D edge of the primary colour (`--color-primary-edge`). */
  primaryEdge: "#312e81",
  /** v2 coral accent (`--color-accent`). */
  accent: "#f05e3c",
  /** v2 app background (`--color-canvas`): use for `theme-color` and manifest `background_color`. */
  canvas: "#f6f7fb",
  /** v2 card surface (`--color-surface`). */
  surface: "#ffffff",
  /** Deepest indigo of the brand scale (`--color-night-950`). */
  night950: "#1e1b4b",
  /** `--color-night-900`. */
  night900: "#272463",
  /** XP gold / lantern glow (`--color-glow-400`). */
  glow400: "#f5b400",
  /**
   * @deprecated v1 name. There is no dark theme any more (PD-066); this is the light
   * canvas. Use `canvas`.
   */
  canvasDark: "#f6f7fb",
  /** @deprecated v1 name for the light canvas. Use `canvas`. */
  canvasLight: "#f6f7fb",
} as const;

/** Themes the tokens render. v2 is light only (PD-066, ADR-014). */
export const THEMES = ["light"] as const;
/**
 * Value of `<html data-theme>`. `"dark"` is a deprecated v1 value kept for API
 * compatibility: it renders the same light tokens (nothing keys off `data-theme` in v2).
 */
export type Theme = (typeof THEMES)[number] | "dark";
