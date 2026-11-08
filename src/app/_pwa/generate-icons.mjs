/**
 * Generates the Polyglow app icons (PLT-002) from the hand-written Lumi lantern glyph
 * below. Original artwork, no third-party assets. The PNGs are committed; re-run after
 * changing the glyph:
 *
 *   node src/app/_pwa/generate-icons.mjs
 *
 * Rasterising uses `sharp`, which Next.js already installs for image optimisation.
 * Colours are the brand palette from `src/components/ui/tokens.css` (night-950 canvas,
 * glow-300/400/500/600 lantern). This file is artwork source, not UI code.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const NIGHT_950 = "#0f0e2a";
const GLOW_300 = "#ffcb4a";
const GLOW_400 = "#ffb820";
const GLOW_500 = "#f59a0b";
const GLOW_600 = "#d97706";

/**
 * Lumi, a paper lantern with a face, on a 512 × 512 canvas. Every shape stays inside a
 * 170 px radius of the centre, well within the 205 px maskable safe zone (40 %).
 */
const LUMI = `
  <circle cx="256" cy="250" r="190" fill="${GLOW_400}" opacity="0.10"/>
  <circle cx="256" cy="250" r="150" fill="${GLOW_400}" opacity="0.14"/>
  <path d="M234 120 Q256 86 278 120" stroke="${GLOW_300}" stroke-width="12" fill="none" stroke-linecap="round"/>
  <ellipse cx="256" cy="250" rx="98" ry="116" fill="${GLOW_400}"/>
  <ellipse cx="256" cy="250" rx="52" ry="114" fill="none" stroke="${GLOW_500}" stroke-width="8" opacity="0.7"/>
  <rect x="210" y="116" width="92" height="28" rx="10" fill="${GLOW_600}"/>
  <rect x="210" y="356" width="92" height="28" rx="10" fill="${GLOW_600}"/>
  <path d="M256 384 V410" stroke="${GLOW_300}" stroke-width="10" stroke-linecap="round"/>
  <circle cx="226" cy="240" r="13" fill="${NIGHT_950}"/>
  <circle cx="286" cy="240" r="13" fill="${NIGHT_950}"/>
  <path d="M232 278 Q256 300 280 278" stroke="${NIGHT_950}" stroke-width="9" fill="none" stroke-linecap="round"/>
`;

/** `rounded`: a rounded-square tile (any-purpose icons, favicon). Otherwise full bleed. */
function svg({ rounded }) {
  const background = rounded
    ? `<rect width="512" height="512" rx="112" fill="${NIGHT_950}"/>`
    : `<rect width="512" height="512" fill="${NIGHT_950}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${background}${LUMI}</svg>\n`;
}

async function png(file, size, rounded) {
  const out = path.join(ROOT, file);
  await mkdir(path.dirname(out), { recursive: true });
  await sharp(Buffer.from(svg({ rounded })))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`wrote ${file} (${size}x${size})`);
}

await png("public/icons/icon-192.png", 192, true);
await png("public/icons/icon-512.png", 512, true);
// Maskable and Apple icons are full bleed: the OS applies its own mask / rounding, and
// iOS fills transparency with black.
await png("public/icons/icon-maskable-512.png", 512, false);
await png("public/apple-touch-icon.png", 180, false);
await writeFile(path.join(ROOT, "src/app/icon.svg"), svg({ rounded: true }));
console.log("wrote src/app/icon.svg");
