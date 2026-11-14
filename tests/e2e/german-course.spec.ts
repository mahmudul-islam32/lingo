import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";
import {
  courseLessons,
  GERMAN_LESSON_1,
  GERMAN_LESSONS,
  germanLesson1,
  lessonUrl,
  nodeNamePattern,
  playLesson,
  readLesson,
  SPANISH,
} from "./helpers/course";
import { completeOnboardingAsSpanishGuest } from "./onboarding-helpers";

/**
 * PLT-024: German (en-de) in onboarding and Learn, at the mobile size. Lesson ids, titles
 * and answers come from `content/courses/<courseId>` (helpers/course.ts), never from code.
 */
test.use({ viewport: { width: 375, height: 667 } });

const h1 = (page: Page) => page.getByRole("heading", { level: 1 });

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

/** Waits for finite animations (step fade-ins), so axe measures the final colours. */
async function settle(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished),
    ),
  );
}

test.describe("German course (PLT-024)", () => {
  test("AC 12: keyboard-only onboarding, the first German lesson played to results, completed on Learn", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "WebKit does not Tab to all controls by default");
    test.slow(); // onboarding + a full lesson + axe

    await page.goto("/");
    await expect(page).toHaveURL(/\/onboarding$/);
    // AC 3: the heading names the default course's language.
    await expect(h1(page)).toHaveText("Learn German in five minutes a day");
    await page.keyboard.press("Tab"); // skip link
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Get started" })).toBeFocused();
    await page.keyboard.press("Enter");

    // AC 1, 2: one card "German · for English speakers", preselected; Continue enabled.
    await expect(h1(page)).toHaveText("What do you want to learn?");
    const group = page.getByRole("radiogroup", { name: "What do you want to learn?" });
    const german = group.getByRole("radio", { name: "German" });
    await expect(group.getByRole("radio")).toHaveCount(1);
    await expect(german).toHaveAccessibleDescription("for English speakers");
    await expect(german).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText("Spanish")).toHaveCount(0);
    await expect(page.getByText("More languages coming soon")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();
    // AC 13: the card fits in full at 375 × 667, no horizontal scrolling, axe clean.
    await expect(german).toBeInViewport({ ratio: 1 });
    await expectNoHorizontalScroll(page);
    await settle(page);
    await expectNoSeriousA11yViolations(page);

    await page.keyboard.press("Tab");
    await expect(german).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Continue" })).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(h1(page)).toHaveText("Choose a daily goal");
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowDown"); // Regular 20 XP
    await expect(page.getByRole("radio", { name: "Regular 20 XP" })).toBeChecked();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Start learning" })).toBeFocused();
    await page.keyboard.press("Enter");

    // AC 4: straight into en-de's first lesson (from the course data).
    await expect(page).toHaveURL(lessonUrl(GERMAN_LESSON_1.id));
    // AC 10: German text is marked as German.
    await expect(page.locator('[data-testid="exercise-area"] [lang="de"]').first()).toBeAttached();
    await playLesson(page, germanLesson1(), { keyboard: true });
    const stats = page.getByRole("list", { name: "Lesson stats" });
    await expect(stats.getByRole("listitem").nth(0)).toContainText("15");

    const done = page.getByRole("button", { name: "Continue" });
    await done.focus();
    await done.press("Enter");
    await expect(page).toHaveURL(/\/$/);

    // AC 7, 9: Learn shows the German course and the current level; Lesson 1 completed.
    await expect(page.getByTestId("course-caption")).toHaveText("German · A1");
    await expect(
      page.getByRole("link", { name: nodeNamePattern(GERMAN_LESSON_1, "completed") }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: nodeNamePattern(GERMAN_LESSONS[1]!, "up next") }),
    ).toBeVisible();
    await expect(page.getByRole("img", { name: "Total XP: 15" })).toBeVisible();

    // AC 13 on Learn.
    await expectNoHorizontalScroll(page);
    await expectNoSeriousA11yViolations(page);
  });

  test("AC 8: a guest already on Spanish keeps the Spanish path, lessons, XP and streak", async ({
    page,
  }) => {
    test.slow();
    const lessons = courseLessons(SPANISH);
    const first = lessons[0]!;
    await completeOnboardingAsSpanishGuest(page);

    // AC 7, 9: the caption follows the settings (Spanish has no levels: name only).
    await expect(page.getByTestId("course-caption")).toHaveText("Spanish");
    await expect(
      page.getByRole("heading", { level: 2, name: SPANISH.units[0]!.title, exact: true }),
    ).toBeVisible();
    // AC 5: an en-es lesson plays on the same route and is saved for en-es.
    await page.getByRole("link", { name: nodeNamePattern(first, "up next") }).click();
    await playLesson(page, readLesson("en-es", first.id));
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL(/\/$/);

    const expectSpanishProgress = async () => {
      await expect(page.getByTestId("course-caption")).toHaveText("Spanish");
      await expect(
        page.getByRole("link", { name: nodeNamePattern(first, "completed") }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: nodeNamePattern(lessons[1]!, "up next") }),
      ).toBeVisible();
      await expect(page.getByRole("img", { name: "Total XP: 15" })).toBeVisible();
      await expect(page.getByRole("img", { name: /^Streak: 1 day/ })).toBeVisible();
    };
    await expectSpanishProgress();
    // Unchanged after a reload (the app start reads the stored settings again).
    await page.reload();
    await expectSpanishProgress();
    await expectNoHorizontalScroll(page);
  });
});
