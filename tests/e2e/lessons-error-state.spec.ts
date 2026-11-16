import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";

/**
 * FIX-005 AC 1, 3, 4: when a lesson can't load, the error state shows a decorative Lumi
 * ember and fits 375 x 667 without horizontal scrolling. After onboarding, the lesson
 * content chunk is aborted and the page reloaded so the content loader fails.
 */
const LESSON_ID = "de-a1-u01-l1-hello";

test.describe("Lesson error state (FIX-005)", () => {
  test.use({ viewport: { width: 375, height: 667 }, reducedMotion: "reduce" });

  test("shows Lumi ember, fits 375 px and keeps both actions on screen", async ({ page }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: "Get started" }).click();
    await page.getByRole("radio", { name: "German" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("radio", { name: "Casual 10 XP" }).click();
    await page.getByRole("button", { name: "Start learning" }).click();
    await expect(page).toHaveURL(new RegExp(`/lesson/${LESSON_ID}$`));

    // Abort the lesson's content chunk (not the page itself) and reload.
    await page.route(
      (url) => !url.pathname.startsWith("/lesson/") && url.pathname.includes("de-a1-u01-l1"),
      (route) => route.abort(),
    );
    await page.reload();

    const heading = page.getByRole("heading", { level: 1, name: "We couldn't load this lesson." });
    await expect(heading).toBeVisible({ timeout: 30_000 });
    await expect(heading).toBeFocused();

    const lumi = page.locator('main svg[data-pose="ember"]');
    await expect(lumi).toBeVisible();
    await expect(lumi).toHaveAttribute("aria-hidden", "true");
    await expect(page.getByTestId("lumi-ember-placeholder")).toHaveCount(0);

    for (const name of ["Try again", "Back to Learn"]) {
      await expect(page.getByRole("button", { name })).toBeInViewport({ ratio: 1 });
    }
    const { scrollWidth, width } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      width: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(width);
    await expectNoSeriousA11yViolations(page);
  });
});
