import type { MetadataRoute } from "next";
import { BRAND_HEX } from "@/components/ui";
import { APP_DESCRIPTION, APP_NAME } from "./_shell/app-name";
import { ICONS } from "./_pwa/pwa-config";

/**
 * Web app manifest (PLT-002), served at `/manifest.webmanifest` and linked from every page
 * by Next.js. Colours come from `BRAND_HEX` so they never drift from the CSS tokens
 * (design v2, ADR-014): primary indigo for the theme, the light canvas for the splash.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: APP_NAME,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "en",
    dir: "ltr",
    theme_color: BRAND_HEX.primary,
    background_color: BRAND_HEX.canvas,
    categories: ["education"],
    icons: [
      { src: ICONS.any192, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: ICONS.any512, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: ICONS.maskable512, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
