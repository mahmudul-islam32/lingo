import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";
import {
  answerCorrectly,
  answerWrong,
  germanLesson1,
  GERMAN_LESSON_1,
  lessonUrl,
  nodeNamePattern,
  type LessonJson,
} from "./helpers/course";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * PLT-029 AC 13, 14, 16 (with LES-023 AC 13): `/review` at 375 × 667, keyboard only,
 * fixed clock. Ids and answers come from the German course files.
 */
test.use({ viewport: { width: 375, height: 667 }, locale: "en-US" });

const LESSON = germanLesson1();
const KEYBOARD = { keyboard: true };
type ExerciseJson = LessonJson["exercises"][number];

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test("a new learner opening /review sees the empty state (AC 8, 13, 14, 16)", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-21T12:00:00"));
  await completeOnboarding(page);
  await page.goto("/review");
  const heading = page.getByRole("heading", { level: 1, name: "Nothing to review yet." });
  await expect(heading).toBeVisible();
  await expect(heading).toBeFocused();
  await expect(
    page.getByText("Answer exercises in any lesson and they come back here."),
  ).toBeVisible();
  // No bottom navigation, no player.
  await expect(page.getByRole("navigation", { name: /main|tabs/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Check" })).toHaveCount(0);
  const link = page.getByRole("link", { name: "Go to Practice" });
  expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  await expectNoHorizontalScroll(page);
  await expectNoSeriousA11yViolations(page);
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/practice$/);
});

/** The exercise of Lesson 1 whose prompt is on screen (review order is the rule's). */
async function currentExercise(page: Page): Promise<ExerciseJson> {
  const heading = page.getByTestId("exercise-area").getByRole("heading", { level: 2 });
  await expect(heading).toBeVisible();
  const text = (await heading.textContent())?.trim();
  // Exercises without a prompt: one match_pairs ("Match the pairs"); listen exercises are
  // skipped in headless Chromium (no audio), so any listen exercise answers them.
  const exercise =
    LESSON.exercises.find((e) => "prompt" in e && !!text?.endsWith(String(e.prompt))) ??
    LESSON.exercises.find(
      (e) => e.type === (text?.includes("Match the pairs") ? "match_pairs" : "listen"),
    );
  if (!exercise) throw new Error(`no Lesson 1 exercise with prompt "${text}"`);
  return exercise;
}

test("finish Lesson 1 with a mistake → review it from Practice (AC 6, 7, 12, 16)", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-11-21T12:00:00"));
  await completeOnboarding(page);
  const node = page.getByRole("link", { name: nodeNamePattern(GERMAN_LESSON_1, "up next") });
  await node.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(lessonUrl(LESSON.id));
  const [first, ...rest] = LESSON.exercises;
  await answerWrong(page, first!, KEYBOARD);
  for (const exercise of rest) await answerCorrectly(page, exercise, KEYBOARD);
  await answerCorrectly(page, first!, KEYBOARD);
  await expect(page.getByRole("heading", { level: 1, name: "Lesson complete!" })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter");

  await page.getByRole("link", { name: "Practice" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/practice$/);
  const review = page.getByTestId("review-card");
  await expect(review).toHaveAttribute("data-state", "due");
  await expect(review).toContainText(/[1-9]\d* exercises? (is|are) ready for review\./);
  // GAM-015 AC 14: the card fits 375 × 667.
  const box = (await review.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(375);
  await expectNoHorizontalScroll(page);
  await review.getByRole("link", { name: "Start review" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/review$/);

  // LES-023 AC 13: the review player fits 375 px.
  await expect(page.getByRole("main", { name: "Review" })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await expectNoSeriousA11yViolations(page);
  const done = page.getByRole("heading", { level: 1, name: "Review complete!" });
  const exerciseArea = page.getByTestId("exercise-area").getByRole("heading", { level: 2 });
  for (let i = 0; i < 20; i += 1) {
    await expect(done.or(exerciseArea)).toBeVisible();
    if (await done.isVisible()) break;
    await answerCorrectly(page, await currentExercise(page), KEYBOARD);
  }
  await expect(done).toBeVisible();
  await expect(page.getByRole("list", { name: "Review stats" })).toContainText(/Total XP\s*\d+/);
  await expect(page.getByText("Review saved.")).toBeVisible();
  await expectNoHorizontalScroll(page);
  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/practice$/);
  // The review is not a lesson: Lesson 1 is listed once.
  await expect(page.getByRole("link", { name: new RegExp(LESSON.title) })).toHaveCount(1);
});

test("offline: an opened review plays and saves on the device (AC 11)", async ({
  page,
  context,
}) => {
  await page.clock.setFixedTime(new Date("2026-11-21T12:00:00"));
  await completeOnboarding(page);
  const node = page.getByRole("link", { name: nodeNamePattern(GERMAN_LESSON_1, "up next") });
  await node.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(lessonUrl(LESSON.id));
  const [first, ...rest] = LESSON.exercises;
  await answerWrong(page, first!, KEYBOARD);
  for (const exercise of rest) await answerCorrectly(page, exercise, KEYBOARD);
  await answerCorrectly(page, first!, KEYBOARD);
  await expect(page.getByRole("heading", { level: 1, name: "Lesson complete!" })).toBeVisible();

  await page.goto("/review");
  const exerciseHeading = page.getByTestId("exercise-area").getByRole("heading", { level: 2 });
  await expect(exerciseHeading).toBeVisible();
  await context.setOffline(true);
  const done = page.getByRole("heading", { level: 1, name: "Review complete!" });
  for (let i = 0; i < 20; i += 1) {
    await expect(done.or(exerciseHeading)).toBeVisible();
    if (await done.isVisible()) break;
    await answerCorrectly(page, await currentExercise(page), KEYBOARD);
  }
  await expect(done).toBeVisible();
  await expect(page.getByText("Review saved.")).toBeVisible();
  const kinds = await page.evaluate(
    () =>
      new Promise<string[]>((resolve, reject) => {
        const open = indexedDB.open("polyglow");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const read = open.result
            .transaction("lessonResults")
            .objectStore("lessonResults")
            .getAll();
          read.onsuccess = () => {
            resolve((read.result as { kind?: string }[]).map((r) => r.kind ?? "lesson"));
            open.result.close();
          };
        };
      }),
  );
  expect(kinds.sort()).toEqual(["lesson", "review"]);
  await context.setOffline(false);
});
