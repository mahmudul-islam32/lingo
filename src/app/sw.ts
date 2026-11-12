/// <reference lib="webworker" />
/**
 * Polyglow service worker source (PLT-002, ARCHITECTURE §10). Serwist compiles it to
 * `public/sw.js` during `npm run build` and injects the precache manifest into
 * `self.__SW_MANIFEST` (JS/CSS chunks, `public/` icons, plus the app-shell routes added in
 * `next.config.ts`). It is never built or registered under `next dev` or in tests.
 */
import { defaultCache } from "@serwist/next/worker";
import {
  NetworkOnly,
  Serwist,
  type PrecacheEntry,
  type RuntimeCaching,
  type SerwistGlobalConfig,
} from "serwist";
import { OFFLINE_FALLBACK_URL, isSupabaseRequest } from "./_pwa/pwa-config";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Runtime caching, first match wins. Later tickets append their rules above
 * `defaultCache`: `/audio/**` CacheFirst `audio-v<version>`
 * (PLT-015).
 */
const runtimeCaching: RuntimeCaching[] = [
  { matcher: ({ url }) => isSupabaseRequest(url), handler: new NetworkOnly() },
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // A new version waits until the learner accepts the update prompt (PLT-005); it must
  // never take over in the middle of a lesson.
  skipWaiting: false,
  // The very first worker controls the open tab right away, so the shell works offline
  // after a single online visit.
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: OFFLINE_FALLBACK_URL,
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
