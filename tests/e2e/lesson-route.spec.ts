import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";
import {
  GERMAN,
  GERMAN_LESSONS,
  GERMAN_LESSON_1,
  germanLesson1,
  lessonUrl,
  nodeNamePattern,
  playLesson,
  unitNamePattern,
} from "./helpers/course";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * PLT-007 (course loading, `/lesson/[lessonId]`) and PLT-008 (results saved on the
 * device), with the real exercise registry (LES-004..007) and the LES-008 results screen.
 * Since PLT-009 Learn shows the GAM-008 skill path instead of the temporary lesson list.
 * Since PLT-024 the course is German (en-de, the default and only offered course); ids,
 * titles and answers come from `content/courses/en-de` (helpers/course.ts). The hidden
 * Spanish course is covered with a seeded guest in `german-course.spec.ts`.
 */
const UNIT_1 = GERMAN.units[0]!;
const LESSON_1 = GERMAN_LESSON_1;
const LESSON_2 = GERMAN_LESSONS[1]!;
const FIRST_PROMPT = (() => {
  const first = germanLesson1().exercises[0]!;
  if (first.type !== "multiple_choice") throw new Error("Lesson 1 starts with a choice");
  return first.prompt;
})();

const lesson1Node = (page: Page) =>
  page.getByRole("link", { name: nodeNamePattern(LESSON_1, "up next") });

/** Waits until Learn has loaded the course's lesson chunks in the background. */
async function waitForLessonPreload(page: Page) {
  await page.waitForLoadState("networkidle");
}

test.describe("lesson route and lesson list (PLT-007)", () => {
  test("criteria 6 and 13 / PLT-024 AC 4: a new visitor completes onboarding and sees the first German exercise", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: "Get started" }).click();
    await page.getByRole("button", { name: "Continue" }).click(); // German is preselected
    await page.getByRole("radio", { name: "Casual 10 XP" }).click();
    await page.getByRole("button", { name: "Start learning" }).click();

    // en-de lesson ids follow ADR-008 (`de-a1-u01-l1-…`); the content itself is the pm's.
    expect(LESSON_1.id).toMatch(/^de-a1-u01-l1-[a-z0-9-]+$/);
    await expect(page).toHaveURL(lessonUrl(LESSON_1.id));
    await expect(
      page.getByRole("heading", { level: 2, name: FIRST_PROMPT, exact: true }),
    ).toBeVisible();
    // Criterion 3: full screen, no bottom navigation.
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
    await page.goto("/");
    await expect(lesson1Node(page)).toBeVisible();
  });

  test("criteria 4, 5, 11 and 12 (since PLT-009): Learn shows Unit 1 on the skill path", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await completeOnboarding(page);
    await expect(page.getByRole("heading", { name: unitNamePattern(UNIT_1) })).toBeVisible();
    await expect(
      page.getByText(`0 of ${UNIT_1.lessons.length} lessons completed`).first(),
    ).toBeVisible();

    const list = page.getByRole("list", { name: unitNamePattern(UNIT_1) });
    await expect(list.getByRole("listitem")).toHaveCount(UNIT_1.lessons.length);
    const names = GERMAN_LESSONS.slice(0, UNIT_1.lessons.length).map((lesson, index) =>
      nodeNamePattern(lesson, index === 0 ? "up next" : "locked"),
    );
    for (const [index, name] of names.entries()) {
      await expect(
        list
          .getByRole("listitem")
          .nth(index)
          .getByRole(index === 0 ? "link" : "button"),
      ).toHaveAccessibleName(name);
    }

    await expectNoSeriousA11yViolations(page);

    // Keyboard: focus the next lesson and press Enter.
    await lesson1Node(page).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(lessonUrl(LESSON_1.id));
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
  });

  test("criterion 2: an unknown lesson id shows the 404 page", async ({ page }) => {
    const response = await page.goto("/lesson/not-a-lesson");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: "We couldn't find that page" }),
    ).toBeVisible();
  });

  test("criteria 7 and 13: after one online visit to Learn, Lesson 1 opens offline", async ({
    page,
    context,
  }) => {
    await completeOnboarding(page);
    await expect(lesson1Node(page)).toBeVisible();
    await waitForLessonPreload(page);

    await context.setOffline(true);
    await lesson1Node(page).click();
    await expect(page).toHaveURL(lessonUrl(LESSON_1.id));
    await expect(
      page.getByRole("heading", { level: 2, name: FIRST_PROMPT, exact: true }),
    ).toBeVisible();
    await context.setOffline(false);
  });
});

test.describe("results saved on the device (PLT-008)", () => {
  test("playing Lesson 1 to the end saves it: completed on the path, kept after reload", async ({
    page,
  }) => {
    await completeOnboarding(page);
    await lesson1Node(page).click();
    await playLesson(page, germanLesson1());
    // LES-008 results screen; its "Continue" goes back to Learn (no reload).
    await page.getByRole("button", { name: "Continue" }).click();

    // Criteria 5 and 6: the new state is there without a page reload.
    await expect(page).toHaveURL(/\/$/);
    const completed = page.getByRole("link", { name: nodeNamePattern(LESSON_1, "completed") });
    await expect(completed).toBeVisible();
    await expect(
      page.getByRole("link", { name: nodeNamePattern(LESSON_2, "up next") }),
    ).toBeVisible();

    // Criterion 7: survives a reload.
    await page.reload();
    await expect(completed).toBeVisible();
  });

  test("a lesson finished offline is saved and shown as completed", async ({ page, context }) => {
    await completeOnboarding(page);
    await expect(lesson1Node(page)).toBeVisible();
    await waitForLessonPreload(page);

    await context.setOffline(true);
    await lesson1Node(page).click();
    await playLesson(page, germanLesson1());
    await expect(page.getByText("We couldn't save this lesson on your device.")).toHaveCount(0);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(
      page.getByRole("link", { name: nodeNamePattern(LESSON_1, "completed") }),
    ).toBeVisible();
    await context.setOffline(false);
  });
});
