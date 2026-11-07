import { randomUUID } from "node:crypto";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";
import { PRECACHED_ROUTES } from "./src/app/_pwa/pwa-config";

/**
 * Revision for the precached app-shell HTML (PLT-002). A new value per build, so every
 * deploy refreshes the cached pages; hashed JS/CSS chunks keep their own revisions.
 */
const shellRevision = randomUUID();

/**
 * Serwist (PLT-002, ARCHITECTURE §10). `@serwist/next` hooks into webpack only, so
 * `npm run build` runs `next build --webpack`; `next dev` stays on Turbopack with the
 * worker disabled. We register the worker ourselves (`ServiceWorkerRegistration`), and
 * the page must not reload on reconnect (PLT-006 shows "Back online" instead).
 */
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
  register: false,
  reloadOnOnline: false,
  cacheOnNavigation: false,
  manifestTransforms: [
    async (entries) => ({
      manifest: [
        ...entries,
        ...PRECACHED_ROUTES.map((url) => ({ url, revision: shellRevision, size: 0 })),
      ],
      warnings: [],
    }),
  ],
});

/** Tailwind v4 through the same loader for both bundlers (ADR-001 uses it for Turbopack). */
const TAILWIND_LOADER = "@tailwindcss/turbopack";

/**
 * Webpack (production build only): run the Tailwind loader on our own CSS before Next's
 * built-in CSS pipeline. It is a `resource` condition and an `enforce: "pre"` rule rather
 * than a `test` rule on purpose: Next disables its built-in CSS support when a top-level
 * rule has a CSS `test`/`include`.
 */
const tailwindPreRule = {
  resource: { and: [/\.css$/i], not: [/node_modules/] },
  enforce: "pre" as const,
  use: [{ loader: TAILWIND_LOADER }],
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: [TAILWIND_LOADER],
        as: "*.css",
      },
    },
  },
  webpack(config: { module: { rules: unknown[] } }) {
    config.module.rules.push(tailwindPreRule);
    return config;
  },
};

export default withSerwist(nextConfig);
