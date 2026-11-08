import base from "./playwright.config";
import { defineConfig } from "@playwright/test";
export default defineConfig({
  ...base,
  projects: base.projects?.map((p) => ({
    ...p,
    use: { ...p.use, launchOptions: { executablePath: "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome" } },
  })),
  webServer: { command: "npm run start", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120000 },
});
