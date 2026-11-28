import { defineConfig } from "@playwright/test";

/**
 * CTO-025 (ADR-020 §9): the `accounts` project runs against the LOCAL Supabase stack
 * (`supabase start`), never hosted. It has no web server: until the auth screens exist
 * (PLT-010 …) it tests Auth and the REST API directly. Every spec skips with a clear
 * message when the stack isn't running, so `npm run test:e2e:accounts` never fails just
 * because Docker is missing. The default e2e projects (`playwright.config.ts`) don't
 * include these specs and need no Supabase.
 */
export default defineConfig({
  testDir: "./tests/accounts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  projects: [{ name: "accounts" }],
});
