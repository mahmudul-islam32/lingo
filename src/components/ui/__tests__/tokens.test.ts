// @vitest-environment node
/**
 * Guards the design tokens (design system v2, CTO-016): WCAG AA contrast for every
 * text/background pair the shared components use, 3:1 for non-text UI, that the 3D
 * shadows use palette colours, and that the TS constants match the CSS.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BRAND_HEX, THEMES } from "../tokens";

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

const theme = block("@theme static");

function vars(body: string, prefix: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = new RegExp(`--${prefix}-([a-z0-9-]+):\\s*([^;]+);`, "g");
  for (const m of body.matchAll(re)) out[m[1]!] = m[2]!.replace(/\s+/g, " ").trim();
  return out;
}

const colors = vars(theme, "color");
const shadows = vars(theme, "shadow");

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

const TEXT = 4.5;
const UI = 3;

/** [foreground, background, minimum ratio] */
const PAIRS: Array<[string, string, number]> = [
  // Body text
  ["fg", "canvas", TEXT],
  ["fg", "surface", TEXT],
  ["fg", "surface-raised", TEXT],
  ["fg", "primary-tint", TEXT],
  ["fg", "accent-tint", TEXT],
  ["fg", "danger-tint", TEXT],
  ["fg-muted", "canvas", TEXT],
  ["fg-muted", "surface", TEXT],
  ["fg-muted", "surface-raised", TEXT],
  ["eyebrow", "surface", TEXT],
  ["eyebrow", "canvas", TEXT],
  // Buttons
  ["on-primary", "primary", TEXT],
  ["on-primary", "primary-hover", TEXT],
  ["on-success", "success", TEXT],
  ["on-success", "success-hover", TEXT],
  ["on-danger", "danger", TEXT],
  ["on-danger", "danger-hover", TEXT],
  ["on-disabled", "disabled", TEXT],
  ["primary-fg", "primary-soft", TEXT],
  ["primary", "surface", TEXT],
  ["primary", "canvas", TEXT],
  ["primary", "primary-tint", TEXT],
  ["night-100", "primary", TEXT],
  ["night-200", "primary", TEXT],
  ["night-50", "night-700", TEXT],
  // Feedback text
  ["success-fg", "success-soft", TEXT],
  ["success", "surface", TEXT],
  ["danger-fg", "danger-soft", TEXT],
  ["danger", "surface", TEXT],
  ["danger", "danger-tint", TEXT],
  // XP, streak, hearts text
  ["xp", "surface", TEXT],
  ["xp", "canvas", TEXT],
  ["xp", "surface-raised", TEXT],
  ["xp", "xp-soft", TEXT],
  ["on-xp-gold", "xp-gold", TEXT],
  ["accent-fg", "accent-soft", TEXT],
  ["accent-fg", "accent-tint", TEXT],
  ["accent-strong", "surface", TEXT],
  ["accent-strong", "canvas", TEXT],
  ["heart-fg", "surface", TEXT],
  ["heart-fg", "canvas", TEXT],
  // Chip tones
  ["primary-fg", "primary-tint", TEXT],
  ["pink-fg", "pink-soft", TEXT],
  ["glow-800", "xp-soft", TEXT],
  ["success", "success-soft", TEXT],
  // Lumi face ink on the lantern body
  ["night-900", "glow-400", TEXT],
  ["night-900", "glow-300", TEXT],
  ["glow-100", "glow-800", TEXT],
  // Non-text UI (WCAG 1.4.11): focus ring, control outlines, icons, progress fills.
  ["focus", "canvas", UI],
  ["focus", "surface", UI],
  ["border-strong", "surface", UI],
  ["border-strong", "canvas", UI],
  ["border-strong", "surface-raised", UI],
  ["fg-subtle", "surface", UI],
  ["fg-subtle", "canvas", UI],
  ["heart", "surface", UI],
  ["heart", "canvas", UI],
  ["accent", "surface", UI],
  ["accent", "canvas", UI],
  ["on-accent", "accent", UI],
  ["progress", "track", UI],
  ["progress", "surface-raised", UI],
  ["success", "track", UI],
  ["xp", "track", UI],
  ["accent-edge", "track", UI],
  ["primary", "primary-soft", UI],
  ["success", "success-soft", UI],
  ["danger", "danger-soft", UI],
];

describe("contrast (light theme)", () => {
  it.each(PAIRS)("%s on %s ≥ %s:1", (fg, bg, min) => {
    expect(colors[fg], fg).toMatch(/^#[0-9a-f]{6}$/);
    expect(colors[bg], bg).toMatch(/^#[0-9a-f]{6}$/);
    expect(contrast(colors[fg]!, colors[bg]!)).toBeGreaterThanOrEqual(min);
  });
});

describe("theme", () => {
  it("is light only: no dark scheme or per-theme overrides (PD-066)", () => {
    expect(css).toMatch(/color-scheme:\s*light/);
    expect(css).not.toMatch(/color-scheme:\s*dark/);
    expect(css).not.toContain("[data-theme");
    expect(THEMES).toEqual(["light"]);
  });

  it("keeps the v1 token names features use", () => {
    for (const name of [
      "canvas",
      "surface",
      "surface-raised",
      "fg",
      "fg-muted",
      "border",
      "border-strong",
      "primary",
      "primary-hover",
      "on-primary",
      "focus",
      "success",
      "success-hover",
      "on-success",
      "success-soft",
      "success-fg",
      "danger",
      "danger-hover",
      "on-danger",
      "danger-soft",
      "danger-fg",
      "xp",
      "progress",
      "heart",
      "backdrop",
      "night-50",
      "night-950",
      "glow-50",
      "glow-900",
    ]) {
      expect(colors[name], name).toBeDefined();
    }
  });

  it("uses the brief's palette for the main roles", () => {
    expect(colors.primary).toBe("#4338ca");
    expect(colors["primary-edge"]).toBe("#312e81");
    expect(colors.accent).toBe("#f05e3c"); // brief #F2613F, nudged for 3:1 on canvas
    expect(colors["xp-gold"]).toBe("#f5b400");
    expect(colors.success).toBe("#15803d");
    expect(colors.danger).toBe("#b91c1c");
    expect(colors.heart).toBe("#f43f5e");
    expect(colors.canvas).toBe("#f6f7fb");
    expect(colors.surface).toBe("#ffffff");
    expect(colors.border).toBe("#e3e5ee");
    expect(colors.fg).toBe("#1b1d2a");
  });
});

describe("3D shadows", () => {
  const palette = new Set(Object.values(colors));

  it.each(Object.entries(shadows))("%s is a solid shadow in palette colours", (_name, value) => {
    const hexes = value.match(/#[0-9a-f]{6}/g) ?? [];
    expect(hexes.length).toBeGreaterThan(0);
    for (const hex of hexes) expect(palette.has(hex), hex).toBe(true);
    // No blur: every layer is "0 <y>px 0 [spread] colour".
    for (const layer of value.split(",")) {
      expect(layer.trim()).toMatch(/^0 (\d+px|0) 0( \d+px)? #[0-9a-f]{6}$/);
    }
  });

  it("primary and card shadows match the brief", () => {
    expect(shadows["3d-primary"]).toBe("0 4px 0 #312e81");
    expect(shadows["3d-card"]).toBe("0 3px 0 #e3e5ee");
    expect(shadows["3d-node"]).toBe("0 6px 0 #312e81");
    expect(shadows["3d-node-locked"]).toBe("0 6px 0 #cdd0dd");
  });
});

describe("feedback colours are not brand colours", () => {
  it.each(["success", "danger", "success-soft", "danger-soft"])("%s differs from brand", (k) => {
    const brand = Object.entries(colors)
      .filter(([key]) => /^(night|glow|coral)-/.test(key))
      .map(([, v]) => v);
    expect(brand).not.toContain(colors[k]);
  });
});

describe("fonts", () => {
  it("uses the telc app's system font stacks (TELC-002)", () => {
    const fonts = vars(block("@theme inline"), "font");
    expect(fonts.display).toContain("-apple-system");
    expect(fonts.body).toContain('"SF Pro Text"');
    expect(fonts.sans).toContain('"SF Pro Text"');
    expect(fonts.num).toContain('"SF Pro Rounded"');
  });
});

describe("BRAND_HEX", () => {
  it("matches tokens.css", () => {
    expect(BRAND_HEX.primary).toBe(colors.primary);
    expect(BRAND_HEX.primaryEdge).toBe(colors["primary-edge"]);
    expect(BRAND_HEX.accent).toBe(colors.accent);
    expect(BRAND_HEX.canvas).toBe(colors.canvas);
    expect(BRAND_HEX.surface).toBe(colors.surface);
    expect(BRAND_HEX.night950).toBe(colors["night-950"]);
    expect(BRAND_HEX.night900).toBe(colors["night-900"]);
    expect(BRAND_HEX.glow400).toBe(colors["glow-400"]);
    expect(BRAND_HEX.canvasDark).toBe(colors.canvas);
    expect(BRAND_HEX.canvasLight).toBe(colors.canvas);
  });
});
