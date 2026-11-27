import { expect, test, type Locator, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * PLT-027 AC 17, 18 (with GAM-013's card): goal date at 375 × 667, keyboard only, fixed
 * clock 2026-11-21. Set A2 by 2027-03-12 in Profile → Learn shows the plan; "Use 20 XP a
 * day" with a 10 XP goal → on track; remove the plan → Learn shows the "Set a goal date"
 * link. The date is filled with `fill` (the native picker's segments depend on the locale);
 * everything else is focus + Enter.
 */
test.use({ viewport: { width: 375, height: 667 }, locale: "en-US" });

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

async function press(page: Page, locator: ReturnType<Page["getByRole"]>, key = "Enter") {
  await locator.focus();
  await page.keyboard.press(key);
}

/**
 * Waits until the dialog's open animation (`motion-safe:animate-slide-up`, opacity 0 → 1
 * over 200 ms) has finished. axe computes contrast with the panel's current opacity, so a
 * check during the fade reports the option descriptions as low contrast on slow runners
 * (PLT-028 CI: #666975 on #c6c7ca at half opacity). The static colours pass AA.
 */
async function dialogSettled(dialog: Locator) {
  await dialog.evaluate((el) =>
    Promise.all(el.getAnimations({ subtree: true }).map((animation) => animation.finished)),
  );
  await expect(dialog).toHaveCSS("opacity", "1");
}

test("set, use and remove a goal date (Profile → Learn)", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-21T12:00:00"));
  await completeOnboarding(page, "Casual 10 XP");

  // No plan: only the text link on Learn; it opens Profile's dialog (AC 9, 10, 12).
  const setLink = page.getByRole("link", { name: "Set a goal date" });
  await expect(setLink).toBeVisible();
  await press(page, setLink);
  await expect(page).toHaveURL(/\/profile\?edit=goal-date$/);
  const dialog = page.getByRole("dialog", { name: "Your goal date" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("radio", { name: /A2/ })).toHaveAttribute("aria-checked", "true");

  // Validation, then a valid date with the preview (AC 3, 4).
  const save = dialog.getByRole("button", { name: "Save" });
  await press(page, save);
  const date = dialog.getByLabel("By when?");
  await expect(date).toBeFocused();
  await expect(dialog.getByText("Pick a date.")).toBeVisible();
  await date.fill("2027-03-12");
  await expect(dialog.getByTestId("goal-date-preview")).toHaveText(
    "130 lessons left · about 2 lessons a day. Suggested daily goal: 20 XP.",
  );
  await expectNoHorizontalScroll(page);
  await dialogSettled(dialog);
  await expectNoSeriousA11yViolations(page);
  await press(page, save);
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Goal date saved.")).toBeVisible();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByTestId("goal-date-value")).toHaveText("Finish A2 by 12 Mar 2027");
  await expect(page.getByRole("button", { name: "Change goal date" })).toBeFocused();
  // Suggest only: the daily goal is still 10 XP (PD-071).
  await expect(page.getByTestId("daily-goal-value")).toHaveText("Casual · 10 XP");

  // Learn shows the plan (AC 10, 18).
  await press(page, page.getByRole("link", { name: "Learn" }));
  const card = page.getByRole("region", { name: "Goal date" });
  await expect(card).toContainText("Goal: finish A2 by 12 Mar 2027");
  await expect(card).toContainText("130 lessons left · 111 days to go");
  await expectNoHorizontalScroll(page);

  // "Use 20 XP a day" saves the daily goal; the card turns on track (AC 11).
  await press(page, card.getByRole("button", { name: "Use 20 XP a day" }));
  await expect(page.getByText("Daily goal set to 20 XP.")).toBeVisible();
  await expect(card).toContainText("On track.");

  // Remove in Profile → Learn shows the link again (AC 6, 18).
  await press(page, page.getByRole("link", { name: "Profile" }));
  await expect(page.getByTestId("daily-goal-value")).toHaveText("Regular · 20 XP");
  await press(page, page.getByRole("button", { name: "Change goal date" }));
  await press(page, dialog.getByRole("button", { name: "Remove goal date" }));
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Goal date removed.")).toBeVisible();
  await expect(page.getByTestId("goal-date-value")).toHaveText("Not set");
  await press(page, page.getByRole("link", { name: "Learn" }));
  await expect(page.getByRole("link", { name: "Set a goal date" })).toBeVisible();
});
