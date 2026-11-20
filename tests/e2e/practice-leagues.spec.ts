import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";
import {
  GERMAN_LESSON_1,
  germanLesson1,
  lessonUrl,
  nodeNamePattern,
  playLesson,
} from "./helpers/course";
import { seedHearts } from "./helpers/seed";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * GAM-012 at 375 × 667, keyboard only: the Practice tab lists finished lessons and starts
 * them as free practice at 0 hearts (AC6–AC9, AC17); the Leagues tab is an honest state
 * with no leaderboard (AC10, AC11). Both pass axe (AC13) without horizontal scroll (AC14).
 *
 * The `/practice` and `/leagues` routes come from PLT-026 (dev-platform); until that
 * merges the specs skip with that reason instead of failing on a 404.
 */
test.use({ viewport: { width: 375, height: 667 } });

async function openTab(page: Page, path: "/practice" | "/leagues") {
  const response = await page.goto(path);
  test.skip(response?.status() === 404, `${path} is added by PLT-026`);
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("Practice tab (GAM-012)", () => {
  test("AC 9: with no finished lesson, Lumi and 'Go to Learn'", async ({ page }) => {
    await completeOnboarding(page);
    await openTab(page, "/practice");
    await expect(page.getByRole("heading", { level: 1, name: "Practice" })).toBeVisible();
    await expect(page.getByText("Finish your first lesson to practise it here.")).toBeVisible();
    const learn = page.getByRole("main").getByRole("link", { name: "Go to Learn" });
    await expect(learn).toHaveAttribute("href", "/");
    await expectNoHorizontalScroll(page);
    await expectNoSeriousA11yViolations(page);
  });

  test("AC 17: finish a lesson, open Practice, start it at 0 hearts and see the practice badge", async ({
    page,
  }) => {
    test.slow();
    await completeOnboarding(page);
    await page.getByRole("link", { name: nodeNamePattern(GERMAN_LESSON_1, "up next") }).click();
    await playLesson(page, germanLesson1());
    await expect(page.getByText("Lesson saved.")).toBeAttached();
    await page.goto("/");
    await seedHearts(page, 0);

    await openTab(page, "/practice");
    await expect(page.getByRole("img", { name: "Hearts: 0 of 5" })).toBeVisible();
    const practise = page.getByRole("link", { name: `Practise ${GERMAN_LESSON_1.title}` });
    await expect(practise).toBeVisible();
    const box = await practise.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(48);
    await expectNoHorizontalScroll(page);
    await expectNoSeriousA11yViolations(page);

    await practise.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(lessonUrl(GERMAN_LESSON_1.id));
    await expect(page.getByTestId("practice-badge")).toContainText("Practice");
  });
});

test.describe("Leagues tab (GAM-012)", () => {
  test("AC 10, 11: honest state, the learner's own weekly XP, no list or controls", async ({
    page,
  }) => {
    await completeOnboarding(page);
    await openTab(page, "/leagues");
    await expect(
      page.getByRole("heading", { level: 1, name: "Leagues arrive with accounts" }),
    ).toBeVisible();
    await expect(page.getByText("Your XP this week")).toBeVisible();
    await expect(page.getByText("0 XP")).toBeVisible();
    const content = page.getByTestId("leagues");
    await expect(content.getByRole("listitem")).toHaveCount(0);
    await expect(content.getByRole("link")).toHaveCount(0);
    await expect(content.getByRole("button")).toHaveCount(0);
    await expectNoHorizontalScroll(page);
    await expectNoSeriousA11yViolations(page);
  });
});
