import { devices, expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations, SKILL_PATH_KNOWN_ISSUES } from "./axe";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * PLT-005 install card. Headless Chromium never fires a real `beforeinstallprompt`, so
 * the spec dispatches a stand-in event with the same `prompt()` / `userChoice` shape.
 */

const DISMISSED_KEY = "polyglow.installPromptDismissedAt";
const DAY = 24 * 60 * 60 * 1000;

const installCard = (page: Page) => page.getByRole("status", { name: "Install Polyglow" });

async function firePrompt(page: Page, outcome: "accepted" | "dismissed" = "accepted") {
  return page.evaluate((choice) => {
    const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: string }>;
    };
    const w = window as unknown as { __prompted?: number };
    w.__prompted = 0;
    event.prompt = () => {
      w.__prompted = (w.__prompted ?? 0) + 1;
      return Promise.resolve();
    };
    event.userChoice = Promise.resolve({ outcome: choice });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  }, outcome);
}

test.describe("install card", () => {
  test("shows on Learn after onboarding; Install opens the native prompt", async ({ page }) => {
    await completeOnboarding(page);
    expect(await firePrompt(page)).toBe(true);

    const card = installCard(page);
    await expect(card).toBeVisible();
    await expect(card).toContainText("Open it from your home screen, even offline.");
    // On Learn, so the skill path's known axe issue applies (GAM-008, see axe.ts).
    await expectNoSeriousA11yViolations(page, SKILL_PATH_KNOWN_ISSUES);

    // Both buttons fit at 375 px (Pixel 7 is 412 px; check against the card box).
    const install = card.getByRole("button", { name: "Install" });
    const notNow = card.getByRole("button", { name: "Not now" });
    const cardBox = (await card.boundingBox())!;
    for (const button of [install, notNow]) {
      const box = (await button.boundingBox())!;
      expect(box.x + box.width).toBeLessThanOrEqual(cardBox.x + cardBox.width);
    }

    await install.focus();
    await page.keyboard.press("Enter");
    await expect(card).toHaveCount(0);
    expect(await page.evaluate(() => (window as { __prompted?: number }).__prompted)).toBe(1);
  });

  test("Not now hides it for 7 days, then it returns", async ({ page }) => {
    await completeOnboarding(page);
    await firePrompt(page);
    await installCard(page).getByRole("button", { name: "Not now" }).click();
    await expect(installCard(page)).toHaveCount(0);
    expect(await page.evaluate((k) => localStorage.getItem(k), DISMISSED_KEY)).toBeTruthy();

    // Same device, new load: still hidden.
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
    await firePrompt(page);
    await expect(installCard(page)).toHaveCount(0);

    // Dismissed eight days ago: shown again.
    await page.evaluate(([k, iso]) => localStorage.setItem(k, iso), [
      DISMISSED_KEY,
      new Date(Date.now() - 8 * DAY).toISOString(),
    ] as const);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
    await firePrompt(page);
    await expect(installCard(page)).toBeVisible();
  });

  test("does not show on the Profile tab", async ({ page }) => {
    await completeOnboarding(page);
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Profile" })
      .click();
    await expect(page.getByRole("heading", { level: 1, name: "Profile" })).toBeVisible();
    await firePrompt(page);
    await expect(installCard(page)).toHaveCount(0);
  });
});

test.describe("install card on iOS", () => {
  test.use({ userAgent: devices["iPhone 13"].userAgent });

  test("shows the Share steps with Got it", async ({ page }) => {
    await completeOnboarding(page);
    const card = installCard(page);
    await expect(card).toBeVisible();
    await expect(card).toContainText("Tap Share, then Add to Home Screen");
    await expect(card.getByRole("button", { name: "Install" })).toHaveCount(0);
    await card.getByRole("button", { name: "Got it" }).click();
    await expect(card).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
    await expect(installCard(page)).toHaveCount(0);
  });
});
