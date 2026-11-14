import { expect, type Page } from "@playwright/test";
import { GERMAN, GERMAN_LESSON_1, lessonUrl } from "./helpers/course";
import { seedSettingsCourse } from "./helpers/seed";

/**
 * Completes onboarding (PLT-004) with the default choices, so specs that test the tabs
 * start as a returning learner. Since PLT-024 the only offered course is German (en-de),
 * preselected; "Start learning" opens its first A1 lesson (PLT-007). This helper then
 * goes back to Learn and ends on `/` with the Learn heading visible.
 */
export async function completeOnboarding(page: Page, goal = "Regular 20 XP"): Promise<void> {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "Get started" }).click();
  await expect(page.getByRole("radio", { name: GERMAN.title })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: goal }).click();
  await page.getByRole("button", { name: "Start learning" }).click();
  await expect(page).toHaveURL(lessonUrl(GERMAN_LESSON_1.id));
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
}

/**
 * PLT-024 AC 8 / PD-030: a guest who chose Spanish before it was hidden. Onboards, then
 * seeds `settings.courseId = "en-es"` on the device and reloads, so Learn and the lesson
 * route play the hidden Spanish course. Use it only where a spec is about Spanish content.
 */
export async function completeOnboardingAsSpanishGuest(
  page: Page,
  goal = "Regular 20 XP",
): Promise<void> {
  await completeOnboarding(page, goal);
  await seedSettingsCourse(page, "en-es");
  await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
  await expect(page.getByTestId("course-caption")).toHaveText("Spanish");
}
