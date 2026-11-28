import { defineConfig } from "@playwright/test";

/**
 * CTO-025 (ADR-020 §9): the `accounts` project runs against the LOCAL Supabase stack
 * (`supabase start`), never hosted. Every spec skips with a clear message when the stack
 * isn't running, so `npm run test:e2e:accounts` never fails just because Docker is
 * missing. The default e2e projects (`playwright.config.ts`) don't include these specs and
 * need no Supabase.
 *
 * PLT-010: the UI specs need the app built with the accounts flag on, pointed at the local
 * stack. The web server is a production build (service worker included, so lessons play
 * offline as in production) on port 3000, the `site_url` / redirect URL of
 * `supabase/config.toml`. It only starts when the anon key is known; without it every spec
 * skips anyway. Set `ACCOUNTS_BASE_URL` to reuse an app that is already running.
 */
const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const PORT = 3000;
const baseURL = process.env.ACCOUNTS_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/accounts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  // The first UI spec waits for the production build's first pages; lessons are long.
  timeout: 90_000,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [{ name: "accounts" }],
  webServer:
    ANON_KEY && !process.env.ACCOUNTS_BASE_URL
      ? {
          command: `npm run build && npx next start --port ${PORT}`,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 600_000,
          env: {
            NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: ANON_KEY,
            NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: "",
          },
        }
      : undefined,
});
