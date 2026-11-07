// @vitest-environment node
/**
 * Guards the design tokens: AA contrast for every text/background pair components use,
 * in both themes, and that TS constants match the CSS (single source of truth).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BRAND_HEX } from "../tokens";

const css = readFileSync(join(__dirname, "..", "tokens.css"), "utf8");

function block(selector: string): string {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`missing ${selector}`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") depth--;
    if (depth === 0) return css.slice(open + 1, i);
  }
  throw new Error("unbalanced css");
}

function vars(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/g)) {
    out[m[1]!] = m[2]!;
  }
  return out;
}

const dark = vars(block("@theme static"));
const light = { ...dark, ...vars(block('[data-theme="light"]')) };

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** [foreground, background, minimum ratio] */
const PAIRS: Array<[string, string, number]> = [
  ["fg", "canvas", 4.5],
  ["fg", "surface", 4.5],
  ["fg", "surface-raised", 4.5],
  ["fg-muted", "canvas", 4.5],
  ["fg-muted", "surface", 4.5],
  ["fg-muted", "surface-raised", 4.5],
  ["on-primary", "primary", 4.5],
  ["on-primary", "primary-hover", 4.5],
  ["on-success", "success", 4.5],
  ["on-success", "success-hover", 4.5],
  ["on-danger", "danger", 4.5],
  ["on-danger", "danger-hover", 4.5],
  ["success-fg", "success-soft", 4.5],
  ["danger-fg", "danger-soft", 4.5],
  ["xp", "surface-raised", 4.5],
  ["xp", "surface", 4.5],
  // Non-text UI (WCAG 1.4.11): focus ring, control borders, hearts, progress fill.
  ["focus", "canvas", 3],
  ["focus", "surface", 3],
  ["border-strong", "surface", 3],
  ["border-strong", "surface-raised", 3],
  ["heart", "surface", 3],
  ["progress", "surface-raised", 3],
  ["xp", "surface-raised", 3],
  ["success", "success-soft", 3],
  ["danger", "danger-soft", 3],
];

describe.each([
  ["dark", dark],
  ["light", light],
])("%s theme", (_name, theme) => {
  it.each(PAIRS)("%s on %s ≥ %s:1", (fg, bg, min) => {
    expect(theme[fg], fg).toBeDefined();
    expect(theme[bg], bg).toBeDefined();
    expect(contrast(theme[fg]!, theme[bg]!)).toBeGreaterThanOrEqual(min);
  });
});

describe("feedback colours are not brand colours", () => {
  it.each(["success", "danger", "success-soft", "danger-soft"])("%s differs from brand", (k) => {
    const brand = Object.entries(dark)
      .filter(([key]) => key.startsWith("night-") || key.startsWith("glow-"))
      .map(([, v]) => v);
    expect(brand).not.toContain(dark[k]);
    expect(brand).not.toContain(light[k]);
  });
});

describe("BRAND_HEX", () => {
  it("matches tokens.css", () => {
    expect(BRAND_HEX.night950).toBe(dark["night-950"]);
    expect(BRAND_HEX.night900).toBe(dark["night-900"]);
    expect(BRAND_HEX.glow400).toBe(dark["glow-400"]);
    expect(BRAND_HEX.canvasDark).toBe(dark.canvas);
    expect(BRAND_HEX.canvasLight).toBe(light.canvas);
  });
});
