import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";

/**
 * PLT-002 (installable PWA) and the "opened offline" case of PLT-006. Runs in the
 * `pwa-prod` project against `next start`, because the service worker only exists in
 * production builds.
 */

const learnHeading = (page: Page) => page.getByRole("heading", { level: 1, name: "Learn" });

/** Waits until the service worker is active (precache finished) and controls the page. */
async function waitForServiceWorker(page: Page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
}

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

test.describe("installable PWA (production build)", () => {
  test("links a valid manifest, icons and iOS meta tags", async ({ page, request }) => {
    await page.goto("/");

    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
    expect(manifestHref).toBeTruthy();
    const res = await request.get(manifestHref!);
    expect(res.ok()).toBe(true);
    const manifest = await res.json();
    expect(manifest).toMatchObject({
      name: "Polyglow",
      short_name: "Polyglow",
      start_url: "/",
      scope: "/",
      display: "standalone",
      lang: "en",
    });
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/i);

    const purposes = (manifest.icons as { sizes: string; purpose: string }[]).map(
      (i) => `${i.sizes}:${i.purpose}`,
    );
    expect(purposes).toEqual(
      expect.arrayContaining(["192x192:any", "512x512:any", "512x512:maskable"]),
    );
    for (const icon of manifest.icons as { src: string }[]) {
      const iconRes = await request.get(icon.src);
      expect(iconRes.ok(), icon.src).toBe(true);
      expect(iconRes.headers()["content-type"]).toContain("image/png");
    }

    const apple = page.locator('link[rel="apple-touch-icon"]');
    await expect(apple).toHaveAttribute("sizes", "180x180");
    expect((await request.get((await apple.getAttribute("href"))!)).ok()).toBe(true);

    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute(
      "content",
      "yes",
    );
    await expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')).toHaveCount(1);
    await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute(
      "content",
      "Polyglow",
    );
  });

  test("registers a service worker without console errors", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto("/");
    await waitForServiceWorker(page);
    const scriptURL = await page.evaluate(
      () => navigator.serviceWorker.controller?.scriptURL ?? "",
    );
    expect(new URL(scriptURL).pathname).toBe("/sw.js");

    // Reload with the worker active (criterion 9).
    await page.reload();
    await expect(learnHeading(page)).toBeVisible();
    expect(errors).toEqual([]);
  });

  // Criterion 10: one online visit, then the shell loads from the cache while offline.
  test("reloading / while offline renders the Learn page", async ({ page, context }) => {
    await page.goto("/");
    await expect(learnHeading(page)).toBeVisible();
    await waitForServiceWorker(page);

    await context.setOffline(true);
    await page.reload();
    await expect(learnHeading(page)).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();

    // PLT-006 criterion 4: opened while already offline, the banner shows right away.
    await expect(page.getByRole("status").filter({ hasText: "You're offline." })).toBeVisible();
  });

  test("precached shell routes open offline", async ({ page, context }) => {
    await page.goto("/");
    await waitForServiceWorker(page);
    await context.setOffline(true);
    for (const [path, name] of [
      ["/profile", "Profile"],
      ["/onboarding", "Get started"],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    }
  });

  // Criteria 7 and 11: uncached route offline -> fallback page, accessible, "Try again".
  test("an uncached route offline shows the offline fallback", async ({ page, context }) => {
    await page.goto("/");
    await waitForServiceWorker(page);

    await context.setOffline(true);
    await page.goto("/not-cached-yet");
    const heading = page.getByRole("heading", { level: 1, name: "You're offline" });
    await expect(heading).toBeVisible();
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByText("Check your connection and try again.")).toBeVisible();

    const retry = page.getByRole("button", { name: "Try again" });
    await retry.focus();
    await expect(retry).toBeFocused();
    await expectNoSeriousA11yViolations(page);

    // Back online, "Try again" reloads the requested URL (here: the 404 page).
    await context.setOffline(false);
    await retry.click();
    await expect(
      page.getByRole("heading", { level: 1, name: "We couldn't find that page" }),
    ).toBeVisible();
  });
});
