import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Lumi, LUMI_POSES, LUMI_SIZE_PX, type LumiSize } from "@/components/ui";

const SIZES = Object.keys(LUMI_SIZE_PX) as LumiSize[];
const CASES = LUMI_POSES.flatMap((pose) => SIZES.map((size) => [pose, size] as const));

describe("<Lumi /> poses and sizes (GAM-001 AC1, AC9)", () => {
  it.each(CASES)("renders %s at %s with fixed width/height", (pose, size) => {
    const { container } = render(<Lumi pose={pose} size={size} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    const px = String(LUMI_SIZE_PX[size]);
    expect(svg).toHaveAttribute("width", px);
    expect(svg).toHaveAttribute("height", px);
    expect(svg).toHaveAttribute("viewBox", "0 0 100 100");
    expect(svg).toHaveAttribute("data-pose", pose);
    expect(svg!.childElementCount).toBeGreaterThan(0);
  });

  it("maps sizes to 48 / 96 / 160 px and defaults to md", () => {
    expect(LUMI_SIZE_PX).toEqual({ sm: 48, md: 96, lg: 160 });
    const { container } = render(<Lumi pose="idle" />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "96");
  });

  it("draws four visibly different poses (AC3)", () => {
    const markup = LUMI_POSES.map((pose) => renderToStaticMarkup(<Lumi pose={pose} />));
    expect(new Set(markup).size).toBe(LUMI_POSES.length);
  });

  it("only celebrating has sparkles, and ember has no outer halo (AC3)", () => {
    const count = (pose: (typeof LUMI_POSES)[number]) =>
      render(<Lumi pose={pose} />).container.querySelectorAll("circle[opacity]").length;
    const sparkles = (pose: (typeof LUMI_POSES)[number]) =>
      render(<Lumi pose={pose} />).container.querySelectorAll('[data-part="sparkle"]').length;
    expect(sparkles("celebrating")).toBe(4);
    for (const pose of ["idle", "happy", "ember"] as const) expect(sparkles(pose)).toBe(0);
    expect(count("ember")).toBeLessThan(count("idle"));
  });

  it("forwards className", () => {
    const { container } = render(<Lumi pose="happy" className="mx-auto" />);
    expect(container.querySelector("svg")).toHaveClass("mx-auto");
  });
});

describe("<Lumi /> accessibility (AC4)", () => {
  it.each(LUMI_POSES)("%s is decorative by default", (pose) => {
    const { container } = render(<Lumi pose={pose} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
    expect(svg).not.toHaveAttribute("aria-label");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it.each(LUMI_POSES)("%s exposes role=img and the label when labelled", (pose) => {
    render(<Lumi pose={pose} label="Lumi cheering you on" />);
    const img = screen.getByRole("img", { name: "Lumi cheering you on" });
    expect(img).not.toHaveAttribute("aria-hidden");
  });
});

describe("<Lumi /> tokens, motion and size budget (AC5, AC7, AC8)", () => {
  it.each(LUMI_POSES)("%s markup is at most 5 KB", (pose) => {
    expect(renderToStaticMarkup(<Lumi pose={pose} />).length).toBeLessThanOrEqual(5120);
  });

  it.each(LUMI_POSES)("%s uses no colour literals and no animation", (pose) => {
    const markup = renderToStaticMarkup(<Lumi pose={pose} size="lg" />);
    expect(markup).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(markup).not.toMatch(/rgb|hsl/i);
    expect(markup).not.toMatch(/<animate|animate-|transition/);
  });
});

describe("Lumi outline contrast (AC6)", () => {
  const css = readFileSync(join(__dirname, "..", "tokens.css"), "utf8");
  const pick = (scope: string, name: string): string => {
    const body = css.slice(css.indexOf(scope));
    const m = body.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`));
    if (!m) throw new Error(`missing ${name} in ${scope}`);
    return m[1]!;
  };
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  };
  const contrast = (a: string, b: string) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi! + 0.05) / (lo! + 0.05);
  };

  it("uses the semantic fg ink for the outline", () => {
    expect(renderToStaticMarkup(<Lumi pose="idle" />)).toContain("stroke-fg");
  });

  it.each(["@theme static", '[data-theme="light"]'])(
    "outline (fg) is >= 3:1 against the canvas in %s",
    (scope) => {
      expect(contrast(pick(scope, "fg"), pick(scope, "canvas"))).toBeGreaterThanOrEqual(3);
    },
  );
});
