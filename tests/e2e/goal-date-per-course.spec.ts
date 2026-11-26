import { expect, test, type Locator, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * PLT-028 AC 13 (PD-078: the goal date always belongs to the course you are on), at
 * 375 px, keyboard only, fixed clock 2026-11-21. German: A2 by 2027-03-12 → Learn shows it.
 * Switch to telc B1 → "Not set" and the "Set a goal date" link. telc B1: B1 by 2027-06-30
 * → its card. Back on German → the A2 plan. Remove it → telc B1's plan is still there.
 * Dates are filled with `fill` (the native picker's segments depend on the locale).
 */
test.use({ viewport: { width: 375, height: 667 }, locale: "en-US" });

async function press(page: Page, locator: Locator, key = "Enter") {
  await locator.focus();
  await page.keyboard.press(key);
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

async function goTo(page: Page, tab: "Learn" | "Profile") {
  await press(page, page.getByRole("link", { name: tab }));
  await expect(page).toHaveURL(tab === "Learn" ? /\/$/ : /\/profile$/);
}

async function switchCourse(page: Page, name: RegExp, value: string) {
  await press(page, page.getByRole("button", { name: "Change course" }));
  const dialog = page.getByRole("dialog", { name: "Change course" });
  await press(page, dialog.getByRole("radio", { name }), " ");
  await expect(dialog.getByRole("radio", { name })).toHaveAttribute("aria-checked", "true");
  await press(page, dialog.getByRole("button", { name: "Save" }));
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId("course-value")).toHaveText(value);
}

async function setGoalDate(page: Page, level: "A2" | "B1", date: string) {
  await press(page, page.getByRole("button", { name: "Set goal date" }));
  const dialog = page.getByRole("dialog", { name: "Your goal date" });
  await expect(dialog).toBeVisible();
  await press(page, dialog.getByRole("radio", { name: new RegExp(level) }), " ");
  await expect(dialog.getByRole("radio", { name: new RegExp(level) })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await dialog.getByLabel("By when?").fill(date);
  await expect(dialog.getByTestId("goal-date-preview")).not.toBeEmpty();
  await expectNoHorizontalScroll(page);
  await expectNoSeriousA11yViolations(page);
  await press(page, dialog.getByRole("button", { name: "Save" }));
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Goal date saved.").last()).toBeVisible();
}

test("each course keeps its own goal date across course switches", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-21T12:00:00"));
  await completeOnboarding(page, "Casual 10 XP");
  const card = page.getByRole("region", { name: "Goal date" });
  const setLink = page.getByRole("link", { name: "Set a goal date" });
  const rowValue = page.getByTestId("goal-date-value");

  // German: A2 by 12 Mar 2027 → Learn shows it.
  await goTo(page, "Profile");
  await setGoalDate(page, "A2", "2027-03-12");
  await expect(rowValue).toHaveText("Finish A2 by 12 Mar 2027");
  await goTo(page, "Learn");
  await expect(card).toContainText("Goal: finish A2 by 12 Mar 2027");

  // Switch to telc B1: no plan there (the switch creates or moves none).
  await goTo(page, "Profile");
  await switchCourse(page, /telc B1 Exam Prep/, "telc B1 Exam Prep");
  await expect(rowValue).toHaveText("Not set");
  await goTo(page, "Learn");
  await expect(setLink).toBeVisible();
  await expect(card).toBeHidden();

  // telc B1: B1 by 30 Jun 2027 → its card shows it.
  await goTo(page, "Profile");
  await setGoalDate(page, "B1", "2027-06-30");
  await expect(rowValue).toHaveText("Finish B1 by 30 Jun 2027");
  await goTo(page, "Learn");
  await expect(card).toContainText("Goal: finish B1 by 30 Jun 2027");

  // Back to German: its A2 plan is shown on Learn and in Profile.
  await goTo(page, "Profile");
  await switchCourse(page, /^German/, "German");
  await expect(rowValue).toHaveText("Finish A2 by 12 Mar 2027");
  await goTo(page, "Learn");
  await expect(card).toContainText("Goal: finish A2 by 12 Mar 2027");

  // Remove German's plan → telc B1's plan is still there after switching again.
  await goTo(page, "Profile");
  await press(page, page.getByRole("button", { name: "Change goal date" }));
  const dialog = page.getByRole("dialog", { name: "Your goal date" });
  await press(page, dialog.getByRole("button", { name: "Remove goal date" }));
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Goal date removed.").last()).toBeVisible();
  await expect(rowValue).toHaveText("Not set");
  await switchCourse(page, /telc B1 Exam Prep/, "telc B1 Exam Prep");
  await expect(rowValue).toHaveText("Finish B1 by 30 Jun 2027");
  await goTo(page, "Learn");
  await expect(card).toContainText("Goal: finish B1 by 30 Jun 2027");
});
