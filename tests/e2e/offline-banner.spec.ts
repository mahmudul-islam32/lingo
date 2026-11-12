import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations, SKILL_PATH_KNOWN_ISSUES } from "./axe";
import { completeOnboarding } from "./onboarding-helpers";

/** PLT-006. The "opened while offline" case needs the service worker: see pwa.spec.ts. */

const OFFLINE_TEXT = "You're offline. Some features need a connection.";
const BACK_ONLINE_TEXT = "Back online";

const offlineBanner = (page: Page) => page.getByRole("status").filter({ hasText: OFFLINE_TEXT });
const backOnlineBanner = (page: Page) =>
  page.getByRole("status").filter({ hasText: BACK_ONLINE_TEXT });

test.describe("offline banner", () => {
  test("shows when the connection drops, then 'Back online' for 3 s", async ({ page, context }) => {
    await completeOnboarding(page);
    await expect(offlineBanner(page)).toHaveCount(0);

    await context.setOffline(true);
    await expect(offlineBanner(page)).toBeVisible({ timeout: 2_000 });
    await expect(page.getByTestId("icon-cloud-off")).toBeVisible();
    // On Learn, so the skill path's known axe issue applies (GAM-008, see axe.ts).
    await expectNoSeriousA11yViolations(page, SKILL_PATH_KNOWN_ISSUES);

    await context.setOffline(false);
    await expect(backOnlineBanner(page)).toBeVisible({ timeout: 2_000 });
    await expect(offlineBanner(page)).toHaveCount(0);
    // Gone after 3 s (allow some slack for the browser).
    await expect(backOnlineBanner(page)).toHaveCount(0, { timeout: 5_000 });
  });

  test("shows on onboarding too", async ({ page, context }) => {
    await page.goto("/onboarding");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await context.setOffline(true);
    await expect(offlineBanner(page)).toBeVisible({ timeout: 2_000 });
    await context.setOffline(false);
  });

  test("animates only without reduced motion", async ({ page, context }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await completeOnboarding(page);
    await context.setOffline(true);
    await expect(offlineBanner(page)).toBeVisible({ timeout: 2_000 });
    const animation = await page
      .getByTestId("offline-banner")
      .locator("> div")
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe("none");
    await context.setOffline(false);
  });
});

test.describe("offline banner at 375 px", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("takes at most 2 lines and never covers the nav or content", async ({ page, context }) => {
    await completeOnboarding(page);
    await context.setOffline(true);
    await expect(offlineBanner(page)).toBeVisible({ timeout: 2_000 });

    const text = page.getByTestId("offline-banner").locator("span");
    const { height, lineHeight } = await text.evaluate((el) => ({
      height: el.getBoundingClientRect().height,
      lineHeight: parseFloat(getComputedStyle(el).lineHeight),
    }));
    expect(height).toBeLessThanOrEqual(lineHeight * 2 + 1);

    // Measured in one go: Learn's skill path may still be smooth-scrolling its next
    // lesson into view (GAM-008), which would skew boxes read one after another.
    const boxes = await page.evaluate(() => {
      const rect = (el: Element | null) => el?.getBoundingClientRect() ?? null;
      return {
        banner: rect(document.querySelector('[data-testid="offline-banner"]')),
        nav: rect(document.querySelector('nav[aria-label="Main"]')),
        main: rect(document.querySelector("main")),
      };
    });
    const { banner: bannerBox, nav: navBox, main: mainBox } = boxes;
    expect(bannerBox && navBox && mainBox).toBeTruthy();
    // In the document flow above <main>: no overlap with the content or the nav.
    expect(bannerBox!.y + bannerBox!.height).toBeLessThanOrEqual(mainBox!.y + 0.5);
    expect(bannerBox!.y + bannerBox!.height).toBeLessThanOrEqual(navBox!.y);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await context.setOffline(false);
  });
});
