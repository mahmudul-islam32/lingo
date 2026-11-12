import { expect, test, type Page } from "@playwright/test";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * PLT-005 update toast against the production build (`pwa-prod` project). A "new
 * version" installs and then waits, because the worker uses `skipWaiting: false`.
 */

const TITLE = "A new version of Polyglow is ready";

const updateToast = (page: Page) => page.getByRole("status").filter({ hasText: TITLE });

async function waitForServiceWorker(page: Page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
}

/**
 * Installs a second worker version and resolves once it is waiting. Playwright can't
 * intercept the worker script fetch, so the "new version" is the same worker under a new
 * script URL for the same scope.
 */
async function publishNewVersion(page: Page) {
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.register("/sw.js?v=2", {
      scope: "/",
      updateViaCache: "none",
    });
    await new Promise<void>((resolve) => {
      const done = () => (reg.waiting ? resolve() : setTimeout(done, 50));
      done();
    });
  });
}

test.describe("app-update toast (production build)", () => {
  test("Refresh activates the waiting worker and reloads once", async ({ page }) => {
    await completeOnboarding(page);
    await waitForServiceWorker(page);
    await expect(updateToast(page)).toHaveCount(0);

    await publishNewVersion(page);
    const toast = updateToast(page);
    await expect(toast).toBeVisible();

    let loads = 0;
    page.on("load", () => (loads += 1));
    const refresh = toast.getByRole("button", { name: "Refresh" });
    await refresh.focus();
    await Promise.all([page.waitForEvent("load"), page.keyboard.press("Enter")]);

    await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
    // The formerly waiting worker now controls the page. (After the reload the app
    // registers `/sw.js` again, which in this simulation counts as yet another version.)
    await page.waitForFunction(() =>
      navigator.serviceWorker.controller?.scriptURL.endsWith("/sw.js?v=2"),
    );
    // Exactly one reload.
    await page.waitForTimeout(500);
    expect(loads).toBe(1);
  });

  test("an update during a lesson waits until the learner leaves it", async ({ page }) => {
    await completeOnboarding(page);
    await waitForServiceWorker(page);

    // No lesson route exists yet (PLT-007), so the 404 under /lesson/* stands in for it.
    await page.goto("/lesson/es-u1-l1");
    await waitForServiceWorker(page);
    await publishNewVersion(page);
    await page.waitForTimeout(1_500);
    await expect(updateToast(page)).toHaveCount(0);

    await page.getByRole("link", { name: "Back to Learn" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
    await expect(updateToast(page)).toBeVisible();
  });
});
