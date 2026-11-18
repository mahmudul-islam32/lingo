import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";
import {
  answerCorrectly,
  answerWrong,
  GERMAN_LESSON_1,
  germanLesson1,
  lessonUrl,
  nodeNamePattern,
  playLesson,
} from "./helpers/course";
import { seedHearts } from "./helpers/seed";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * LES-020 (ADR-013, PD-065) at 375 × 667, keyboard only: correct answers earn hearts in
 * the lesson, and a completed lesson replays as free practice.
 */
test.use({ viewport: { width: 375, height: 667 } });

const lessonMeter = (page: Page) =>
  page.getByTestId("hearts-slot").getByRole("img", { name: /^Hearts:/ });
const topBarHearts = (page: Page) =>
  page.getByRole("region", { name: "Your progress" }).getByRole("button", { name: /^Hearts:/ });

/** AC 18: quit button, progress bar, (badge) and meter on one row, meter not cut off. */
async function expectHeaderOnOneRow(page: Page) {
  const quit = await page.getByRole("button", { name: "Quit lesson" }).boundingBox();
  const meter = await page.getByTestId("lesson-hearts-meter").boundingBox();
  const bar = await page.getByRole("progressbar", { name: "Lesson progress" }).boundingBox();
  expect(quit && meter && bar).toBeTruthy();
  const middle = (box: { y: number; height: number }) => box.y + box.height / 2;
  expect(Math.abs(middle(meter!) - middle(quit!))).toBeLessThan(8);
  expect(Math.abs(middle(bar!) - middle(quit!))).toBeLessThan(8);
  expect(meter!.x + meter!.width).toBeLessThanOrEqual(375);
}

test.describe("Earning hearts in a lesson (LES-020)", () => {
  test("AC 1, 5: at 4 hearts a correct answer raises the header to 5, and Learn shows 5", async ({
    page,
  }) => {
    await completeOnboarding(page);
    await seedHearts(page, 4);
    await expect(topBarHearts(page)).toHaveAccessibleName("Hearts: 4 of 5");

    await page.getByRole("link", { name: nodeNamePattern(GERMAN_LESSON_1, "up next") }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(lessonUrl(GERMAN_LESSON_1.id));
    await expect(lessonMeter(page)).toHaveAccessibleName("Hearts: 4 of 5");

    await answerCorrectly(page, germanLesson1().exercises[0]!, { keyboard: true });
    await expect(lessonMeter(page)).toHaveAccessibleName("Hearts: 5 of 5");
    await expect(page.getByTestId("hearts-slot").getByRole("status")).toHaveText(
      "You earned a heart. 5 hearts.",
    );
    await expectHeaderOnOneRow(page);

    // Quit with the keyboard: the earned heart was saved.
    await page.keyboard.press("Escape");
    const dialog = page.getByRole("alertdialog", { name: "Quit this lesson?" });
    await dialog.getByRole("button", { name: "Quit", exact: true }).press("Enter");
    await expect(page).toHaveURL(/\/$/);
    await expect(topBarHearts(page)).toHaveAccessibleName("Hearts: 5 of 5");
  });

  // The lesson route sets `practice` for completed lessons in PLT-025; until then the
  // player opens a completed lesson at 0 hearts on the out-of-hearts screen. The
  // behaviour is covered by the RTL tests in
  // src/features/lessons/hearts/__tests__/HeartsLessonPlayer.test.tsx.
  test.fixme("AC 9-12, 19: at 0 hearts a completed lesson opens as Practice; wrong is free, correct earns (enable after PLT-025 merge)", async ({
    page,
  }) => {
    test.slow();
    await completeOnboarding(page);
    await page.getByRole("link", { name: nodeNamePattern(GERMAN_LESSON_1, "up next") }).click();
    await playLesson(page, germanLesson1());
    await page.goto("/");
    await seedHearts(page, 0);
    await expect(topBarHearts(page)).toHaveAccessibleName("Hearts: 0 of 5");

    await page.getByRole("link", { name: nodeNamePattern(GERMAN_LESSON_1, "completed") }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(lessonUrl(GERMAN_LESSON_1.id));
    await expect(page.getByTestId("practice-badge")).toContainText("Practice");
    await expect(page.getByText("Practice: wrong answers cost no hearts")).toBeAttached();
    await expect(lessonMeter(page)).toHaveAccessibleName("Hearts: 0 of 5");
    await expectHeaderOnOneRow(page);
    await expectNoSeriousA11yViolations(page);

    const [first, second] = germanLesson1().exercises;
    // Wrong: no heart lost, no out-of-hearts screen, the next exercise follows.
    await answerWrong(page, first!, { keyboard: true });
    await expect(lessonMeter(page)).toHaveAccessibleName("Hearts: 0 of 5");
    await expect(page.getByText("You're out of hearts")).toHaveCount(0);
    // Correct: 1 heart.
    await answerCorrectly(page, second!, { keyboard: true });
    await expect(lessonMeter(page)).toHaveAccessibleName("Hearts: 1 of 5");

    await page.keyboard.press("Escape");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Quit", exact: true })
      .press("Enter");
    await expect(page).toHaveURL(/\/$/);
    await expect(topBarHearts(page)).toHaveAccessibleName("Hearts: 1 of 5");
  });
});
