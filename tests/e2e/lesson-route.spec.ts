import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations, SKILL_PATH_KNOWN_ISSUES } from "./axe";
import {
  LESSON_1_FIRST_PROMPT as FIRST_PROMPT,
  LESSON_1_URL,
  playLesson1,
} from "./helpers/lesson-1";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * PLT-007 (course loading, `/lesson/[lessonId]`) and PLT-008 (results saved on the
 * device), with the real exercise registry (LES-004..007) and the LES-008 results screen.
 * Since PLT-009 Learn shows the GAM-008 skill path instead of the temporary lesson list.
 * Lesson 1 ("Hello!") of content/courses/en-es.
 */
const lesson1Node = (page: Page) => page.getByRole("link", { name: /^Lesson 1: Hello!, / });

/** Waits until Learn has loaded the Unit 1 lesson chunks in the background. */
async function waitForLessonPreload(page: Page) {
  await page.waitForLoadState("networkidle");
}

test.describe("lesson route and lesson list (PLT-007)", () => {
  test("criteria 6 and 13: a new visitor completes onboarding and sees Lesson 1's first exercise", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: "Get started" }).click();
    await page.getByRole("radio", { name: "Spanish" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("radio", { name: "Casual 10 XP" }).click();
    await page.getByRole("button", { name: "Start learning" }).click();

    await expect(page).toHaveURL(LESSON_1_URL);
    await expect(page.getByRole("heading", { level: 2, name: FIRST_PROMPT })).toBeVisible();
    // Criterion 3: full screen, no bottom navigation.
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
  });

  test("CTO-008: choosing German (the default course) opens the first A1 lesson", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: "Get started" }).click();
    await page.getByRole("radio", { name: "German" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("radio", { name: "Casual 10 XP" }).click();
    await page.getByRole("button", { name: "Start learning" }).click();

    // en-de lesson ids follow ADR-008 (`de-a1-u01-l1-…`); the content itself is the pm's.
    await expect(page).toHaveURL(/\/lesson\/de-a1-u01-l1-[a-z0-9-]+$/);
    await expect(
      page.getByTestId("exercise-area").getByRole("heading", { level: 2 }),
    ).toBeVisible();
    await page.goto("/");
    await expect(page.getByRole("link", { name: /^Lesson 1: .*, up next$/ })).toBeVisible();
  });

  test("criteria 4, 5, 11 and 12 (since PLT-009): Learn shows Unit 1 on the skill path", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await completeOnboarding(page);
    await expect(page.getByRole("heading", { level: 2, name: "First Steps" })).toBeVisible();
    await expect(page.getByText("0 of 5 lessons completed")).toBeVisible();

    const list = page.getByRole("list", { name: "First Steps" });
    await expect(list.getByRole("listitem")).toHaveCount(5);
    const names = [
      "Lesson 1: Hello!, up next",
      "Lesson 2: Nice to Meet You, locked",
      "Lesson 3: At the Café, locked",
      "Lesson 4: Count It, locked",
      "Lesson 5: Around Town, locked",
    ];
    for (const [index, name] of names.entries()) {
      await expect(
        list
          .getByRole("listitem")
          .nth(index)
          .getByRole(index === 0 ? "link" : "button"),
      ).toHaveAccessibleName(name);
    }

    await expectNoSeriousA11yViolations(page, SKILL_PATH_KNOWN_ISSUES);

    // Keyboard: focus the next lesson and press Enter.
    await lesson1Node(page).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(LESSON_1_URL);
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
    await expect(page).toHaveURL(LESSON_1_URL);
    await expect(page.getByRole("heading", { level: 2, name: FIRST_PROMPT })).toBeVisible();
    await context.setOffline(false);
  });
});

test.describe("results saved on the device (PLT-008)", () => {
  test("playing Lesson 1 to the end saves it: completed on the path, kept after reload", async ({
    page,
  }) => {
    await completeOnboarding(page);
    await lesson1Node(page).click();
    await expect(page).toHaveURL(LESSON_1_URL);
    await playLesson1(page);
    // LES-008 results screen; its "Continue" goes back to Learn (no reload).
    await page.getByRole("button", { name: "Continue" }).click();

    // Criteria 5 and 6: the new state is there without a page reload.
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: "Lesson 1: Hello!, completed" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Lesson 2: Nice to Meet You, up next" }),
    ).toBeVisible();

    // Criterion 7: survives a reload.
    await page.reload();
    await expect(page.getByRole("link", { name: "Lesson 1: Hello!, completed" })).toBeVisible();
  });

  test("a lesson finished offline is saved and shown as completed", async ({ page, context }) => {
    await completeOnboarding(page);
    await expect(lesson1Node(page)).toBeVisible();
    await waitForLessonPreload(page);

    await context.setOffline(true);
    await lesson1Node(page).click();
    await playLesson1(page);
    await expect(page.getByText("We couldn't save this lesson on your device.")).toHaveCount(0);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("link", { name: "Lesson 1: Hello!, completed" })).toBeVisible();
    await context.setOffline(false);
  });
});
