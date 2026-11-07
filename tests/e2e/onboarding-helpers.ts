import { expect, type Page } from "@playwright/test";

/**
 * Completes onboarding (PLT-004) with the default choices, so specs that test the tabs
 * start as a returning learner. Ends on `/` with the Learn heading visible.
 */
export async function completeOnboarding(page: Page, goal = "Regular 20 XP"): Promise<void> {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "Get started" }).click();
  await page.getByRole("radio", { name: "Spanish" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: goal }).click();
  await page.getByRole("button", { name: "Start learning" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
}
