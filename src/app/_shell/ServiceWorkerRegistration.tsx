"use client";

import { useEffect } from "react";
import { SW_SCOPE, SW_URL } from "../_pwa/pwa-config";

/**
 * The part of `@serwist/window`'s `Serwist` instance we use. `@serwist/next` puts it on
 * `window.serwist` in production builds (`register: false` in `next.config.ts`, so we
 * decide when to register). PLT-005 will listen to its `waiting` event for the update toast.
 */
interface SerwistWindowApi {
  register(options?: { immediate?: boolean }): Promise<ServiceWorkerRegistration | undefined>;
}

declare global {
  interface Window {
    serwist?: SerwistWindowApi;
  }
}

/** Only production builds get a worker; `next dev` and tests never register one. */
export function shouldRegisterServiceWorker(env: string | undefined = process.env.NODE_ENV) {
  return env === "production";
}

/**
 * Registers the Serwist service worker (PLT-002) after the page has loaded, so it never
 * competes with the first paint. A new worker waits (no automatic `skipWaiting`); the
 * update prompt is PLT-005. Renders nothing.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!shouldRegisterServiceWorker() || !("serviceWorker" in navigator)) return;

    const register = () => {
      const pending = window.serwist
        ? window.serwist.register()
        : navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE, updateViaCache: "none" });
      pending.catch(() => {
        // Registration failure (private mode, blocked by policy) just means no offline
        // shell; the app keeps working online. Nothing to show the learner.
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
