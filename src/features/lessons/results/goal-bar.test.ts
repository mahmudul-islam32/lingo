// @vitest-environment node
/**
 * FIX-010: the daily-goal bar uses the XP gold fill and still meets WCAG 1.4.11
 * (3:1 non-text contrast) against the track and the card, thanks to its dark-gold edge.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GOAL_BAR_FILL_CLASS } from "./ResultsGamificationRows";

const css = readFileSync(join(__dirname, "../../../components/ui/tokens.css"), "utf8");

function color(name: string): string {
  const match = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6});`).exec(css);
  if (!match) throw new Error(`missing --color-${name}`);
  return match[1]!;
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

describe("daily-goal bar colours (FIX-010)", () => {
  it("fills with xp-gold (#F5B400) and edges it with xp", () => {
    expect(color("xp-gold").toLowerCase()).toBe("#f5b400");
    expect(GOAL_BAR_FILL_CLASS).toContain("bg-xp-gold");
    expect(GOAL_BAR_FILL_CLASS).toContain("var(--color-xp)");
  });

  it("needs the edge: gold and the xp-edge token alone are under 3:1 on the track", () => {
    expect(contrast(color("xp-gold"), color("track"))).toBeLessThan(3);
    expect(contrast(color("xp-edge"), color("track"))).toBeLessThan(3);
  });

  it("the xp edge is at least 3:1 against the track and the white card", () => {
    expect(contrast(color("xp"), color("track"))).toBeGreaterThanOrEqual(3);
    expect(contrast(color("xp"), color("surface"))).toBeGreaterThanOrEqual(3);
  });
});
