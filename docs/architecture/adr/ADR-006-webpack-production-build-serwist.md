# ADR-006: Production build uses webpack so Serwist can generate the service worker

- **Status:** Accepted
- **Date:** 2026-11-07
- **Ticket:** PLT-002 (installable PWA, service worker), PLT-006 (offline indicator)
- **Decider:** cto
- **Amends:** ADR-001 (Turbopack for `dev` and `build`)

## Context

ARCHITECTURE §10 picks Serwist (`@serwist/next`) for the service worker. `@serwist/next`
9.x hooks into the webpack compilation to build `src/app/sw.ts` and inject the precache
manifest. Under Turbopack, which is the Next.js 16 default for `next build`, it does nothing,
so no `public/sw.js` is produced. Without a worker, a lesson can't be completed offline,
and offline lessons are a core design principle.

## Decision

1. `npm run build` runs `next build --webpack`. `npm run dev` stays on Turbopack, and the
   worker is disabled outside production (`disable: NODE_ENV !== "production"`).
2. Tailwind 4 uses the same `@tailwindcss/turbopack` loader under both bundlers. Under
   webpack it is added as an `enforce: "pre"` rule with a `resource` condition, because a
   top-level CSS `test` rule would turn off Next's built-in CSS pipeline.
3. `@serwist/next` is set to `register: false`. The app registers the worker itself after
   `load` (`src/app/_shell/ServiceWorkerRegistration.tsx`), with `skipWaiting: false`, so
   a new version never takes over mid-lesson (the update prompt is PLT-005). The settings
   `reloadOnOnline: false` and `cacheOnNavigation: false` are used because PLT-006 shows
   "Back online" instead of reloading.
4. The app-shell routes (`/`, `/profile`, `/onboarding`, `/offline`, the manifest and the
   favicon) are added to the precache with a per-build revision. Supabase requests are
   `NetworkOnly`, because the sync queue handles retries, not the service worker.
5. The generated `public/sw.js*` and `public/swe-worker*` files are git-, ESLint- and
   Prettier-ignored.
6. Playwright gets a `pwa-prod` project (Pixel 7, `serviceWorkers: "allow"`) against
   `next start` on `PWA_PORT` (default 3100). The other projects ignore `pwa.spec.ts`.

## Consequences

- `dev` and `build` use different bundlers, so a bundler-specific bug can show up only in
  `build`. CI always runs `npm run build` and the e2e job runs against `next start`, so
  such bugs are caught before merge.
- Production builds are somewhat slower than with Turbopack. That's acceptable at our
  size.
- Revisit when Serwist ships stable Turbopack support (`@serwist/turbopack`). Dropping
  `--webpack` and the webpack rule should then be the only change.
