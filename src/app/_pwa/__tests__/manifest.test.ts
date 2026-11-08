import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BRAND_HEX } from "@/components/ui";
import manifest from "../../manifest";
import { DEFAULT_COURSE_ID } from "@/lib/content/constants";
import { bundledLessonPaths } from "@/lib/content/static-params";
import { ICONS, LESSON_ROUTES, PRECACHED_ROUTES, isSupabaseRequest } from "../pwa-config";

const PUBLIC_DIR = path.resolve(__dirname, "../../../../public");

/** Width and height from a PNG's IHDR chunk. */
function pngSize(file: string): { width: number; height: number } {
  const buf = readFileSync(file);
  expect(buf.subarray(1, 4).toString("ascii")).toBe("PNG");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe("web app manifest (PLT-002)", () => {
  const m = manifest();

  it("has the required identity and display fields", () => {
    expect(m).toMatchObject({
      name: "Polyglow",
      short_name: "Polyglow",
      start_url: "/",
      scope: "/",
      display: "standalone",
      lang: "en",
    });
  });

  it("takes its colours from the brand tokens", () => {
    expect(m.theme_color).toBe(BRAND_HEX.night950);
    expect(m.background_color).toBe(BRAND_HEX.canvasLight);
  });

  it("lists 192 and 512 icons plus a maskable 512 icon", () => {
    const icons = m.icons ?? [];
    expect(icons).toContainEqual(
      expect.objectContaining({ sizes: "192x192", type: "image/png", purpose: "any" }),
    );
    expect(icons).toContainEqual(
      expect.objectContaining({ sizes: "512x512", type: "image/png", purpose: "any" }),
    );
    expect(icons).toContainEqual(
      expect.objectContaining({ sizes: "512x512", type: "image/png", purpose: "maskable" }),
    );
  });

  it("points at icon files that exist with the declared dimensions", () => {
    for (const icon of m.icons ?? []) {
      const file = path.join(PUBLIC_DIR, icon.src);
      expect(existsSync(file), icon.src).toBe(true);
      const [w, h] = (icon.sizes ?? "").split("x").map(Number);
      expect(pngSize(file)).toEqual({ width: w, height: h });
    }
  });

  it("has a 180 × 180 apple-touch-icon", () => {
    expect(pngSize(path.join(PUBLIC_DIR, ICONS.apple180))).toEqual({ width: 180, height: 180 });
  });
});

describe("service worker config (PLT-002)", () => {
  it("precaches the app shell routes and the offline fallback", () => {
    expect(PRECACHED_ROUTES).toEqual(
      expect.arrayContaining(["/", "/profile", "/onboarding", "/offline"]),
    );
  });

  it("precaches every prerendered lesson page (PLT-007 criterion 7)", () => {
    expect(LESSON_ROUTES).toEqual(bundledLessonPaths(DEFAULT_COURSE_ID));
    expect(PRECACHED_ROUTES).toEqual(expect.arrayContaining([...LESSON_ROUTES]));
  });

  it.each([
    ["https://abcd.supabase.co/rest/v1/profiles", true],
    ["https://abcd.supabase.co/auth/v1/token", true],
    ["http://127.0.0.1:54321/auth/v1/user", true],
    ["http://localhost:3000/", false],
    ["http://localhost:3000/_next/static/chunks/main.js", false],
    ["http://localhost:3000/icons/icon-192.png", false],
  ])("isSupabaseRequest(%s) is %s", (url, expected) => {
    expect(isSupabaseRequest(new URL(url))).toBe(expected);
  });
});
