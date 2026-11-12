// @vitest-environment node
/**
 * GAM-006 AC13: the ring's stroke and track tokens meet 3:1 against the surfaces the
 * ring sits on, in both themes. Reads the shared `tokens.css` (read-only here).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(__dirname, "../../../../components/ui/tokens.css"), "utf8");

function block(selector: string): string {
  const start = css.indexOf(selector);
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
  for (const m of body.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/g)) out[m[1]!] = m[2]!;
  return out;
}

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

const dark = vars(block("@theme static"));
const light = { ...dark, ...vars(block('[data-theme="light"]')) };

describe.each([
  ["dark", dark],
  ["light", light],
])("daily goal ring tokens, %s theme", (_, theme) => {
  it.each([
    ["xp", "canvas"],
    ["xp", "surface"],
    ["success", "canvas"],
    ["success", "surface"],
    ["border-strong", "canvas"],
    ["border-strong", "surface"],
  ])("%s on %s ≥ 3:1", (fg, bg) => {
    expect(contrast(theme[fg]!, theme[bg]!)).toBeGreaterThanOrEqual(3);
  });
});
