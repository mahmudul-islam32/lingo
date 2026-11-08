import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = `http://localhost:${PORT}`;

/**
 * PWA specs (PLT-002) need a production build: the service worker is never built or
 * registered under `next dev`. They run in their own project against `next start` on a
 * second port.
 */
const PWA_PORT = Number(process.env.PWA_PORT ?? 3100);
const pwaBaseURL = `http://localhost:${PWA_PORT}`;
const PWA_SPECS = /pwa\.spec\.ts$/;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    // Mobile-first: the primary target is a small phone viewport.
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] }, testIgnore: PWA_SPECS },
    { name: "desktop-chrome", use: { ...devices["Desktop Chrome"] }, testIgnore: PWA_SPECS },
    {
      name: "pwa-prod",
      testMatch: PWA_SPECS,
      use: { ...devices["Pixel 7"], baseURL: pwaBaseURL, serviceWorkers: "allow" },
    },
  ],
  webServer: [
    {
      command: process.env.CI ? "npm run start" : "npm run dev",
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      // In CI the build already ran in an earlier step; locally build first.
      command: process.env.CI
        ? `npx next start --port ${PWA_PORT}`
        : `npm run build && npx next start --port ${PWA_PORT}`,
      url: pwaBaseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
  ],
});
