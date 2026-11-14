import { expect, test, type Page } from "@playwright/test";
import {
  answerCorrectly,
  answerWrong,
  germanLesson1,
  GERMAN_LESSON_1,
  lessonUrl,
  nodeNamePattern,
} from "./helpers/course";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * LES-008 criteria 10 and 12: the routed results flow with real content, keyboard only.
 * LES-010 criterion 15: a new guest's first lesson shows "Streak started!", "1 day" and
 * "15 / 20 XP" (default goal 20), and the whole screen (banner and both rows included)
 * still fits 375 × 667.
 * Since PLT-024 the lesson is the first German A1 lesson (`content/courses/en-de`; ids and
 * answers are read from the course files), played on `/lesson/[lessonId]` (PLT-007) and
 * saved on the device (PLT-008).
 *
 * (File named `lessons-results.spec.ts`, not the ticket's `lesson-results.spec.ts`, so it
 * matches dev-lessons' `tests/e2e/lessons*` ownership.)
 */
const LESSON = germanLesson1();
const KEYBOARD = { keyboard: true };

async function startLesson1(page: Page) {
  await completeOnboarding(page);
  const card = page.getByRole("link", { name: nodeNamePattern(GERMAN_LESSON_1, "up next") });
  await card.focus();
  await card.press("Enter");
  await expect(page).toHaveURL(lessonUrl(LESSON.id));
}

test.describe("LES-008 lesson results", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("all answers correct: 15 XP and 100 %, everything visible without scrolling", async ({
    page,
  }) => {
    await startLesson1(page);
    for (const exercise of LESSON.exercises) await answerCorrectly(page, exercise, KEYBOARD);

    const heading = page.getByRole("heading", { level: 1, name: "Lesson complete!" });
    await expect(heading).toBeFocused();
    const stats = page.getByRole("list", { name: "Lesson stats" });
    await expect(stats.getByRole("listitem").nth(0)).toContainText("XP earned");
    await expect(stats.getByRole("listitem").nth(0)).toContainText("15");
    await expect(stats.getByRole("listitem").nth(1)).toContainText("100 %");
    await expect(page.getByText("Perfect lesson! +5 bonus XP")).toBeVisible();
    // LES-010 AC 15: first lesson of a new guest (default goal 20).
    const banner = page.getByTestId("celebration-banner");
    await expect(banner).toContainText("Streak started!");
    await expect(banner).toBeInViewport();
    await expect(stats.getByRole("listitem")).toHaveCount(5);
    await expect(stats.getByRole("listitem").nth(3)).toContainText("Streak started!");
    await expect(stats.getByRole("listitem").nth(3)).toContainText("1 day");
    await expect(stats.getByRole("listitem").nth(4)).toContainText("Daily goal");
    await expect(stats.getByRole("listitem").nth(4)).toContainText("15 / 20 XP");
    await expect(stats.getByRole("listitem").nth(4)).toBeInViewport();
    // Criterion 10 (LES-008) / 12 (LES-010): no scrolling needed at 375 × 667.
    const continueButton = page.getByRole("button", { name: "Continue" });
    await expect(continueButton).toBeInViewport();
    const scrolls = await page.evaluate(
      () => document.documentElement.scrollHeight > window.innerHeight,
    );
    expect(scrolls).toBe(false);
    await continueButton.focus();
    await continueButton.press("Enter");
    await expect(page).toHaveURL(/\/$/);
  });

  test("one mistake: the exercise comes back at the end and the lesson earns 10 XP", async ({
    page,
  }) => {
    const [first, ...rest] = LESSON.exercises;
    if (first?.type !== "multiple_choice") throw new Error("Lesson 1 starts with a choice");
    await startLesson1(page);
    // 1. Answer the first exercise wrong, continue.
    await answerWrong(page, first, KEYBOARD);
    // 2. Answer the rest correctly.
    for (const exercise of rest) await answerCorrectly(page, exercise, KEYBOARD);
    // 3. The missed exercise is shown again last; answer it correctly.
    await expect(
      page.getByRole("heading", { level: 2, name: first.prompt, exact: true }),
    ).toBeVisible();
    await answerCorrectly(page, first, KEYBOARD);

    await expect(page.getByRole("heading", { level: 1, name: "Lesson complete!" })).toBeVisible();
    const stats = page.getByRole("list", { name: "Lesson stats" });
    await expect(stats.getByRole("listitem").nth(0)).toContainText("10");
    await expect(page.getByText(/Perfect lesson!/)).toHaveCount(0);
  });
});
