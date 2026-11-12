import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations, SKILL_PATH_KNOWN_ISSUES } from "./axe";
import { answerFirstExerciseWrong, LESSON_1_URL, playLesson1 } from "./helpers/lesson-1";
import { seedHearts } from "./helpers/seed";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * PLT-009: the v0.3.0 loop on Learn and in the lesson route, with CON-001 content at the
 * mobile size (375 × 667). Learn = GamificationTopBar, StreakLumi + DailyGoalRing,
 * SkillPath; lessons run in HeartsLessonPlayer.
 */
test.use({ viewport: { width: 375, height: 667 } });

const LOCKED_TOAST = "Finish the earlier lessons first.";

const LEARN_AXE = SKILL_PATH_KNOWN_ISSUES;
const OUT_OF_HEARTS = "You're out of hearts";

const topBar = (page: Page) => page.getByRole("region", { name: "Your progress" });
const nav = (page: Page) => page.getByRole("navigation", { name: "Main" });

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("Learn with the gamification loop (PLT-009)", () => {
  test("AC 10 loop: onboarding (goal 20), Lesson 1 all correct, results, then Learn updated", async ({
    page,
  }) => {
    test.slow(); // onboarding + a full 12-exercise lesson + axe
    // AC 5: "Start learning" goes straight to Lesson 1 (keyboard for the choices).
    await page.goto("/onboarding");
    await page.getByRole("button", { name: "Get started" }).press("Enter");
    await page.getByRole("radio", { name: "Spanish" }).click();
    await page.getByRole("button", { name: "Continue" }).press("Enter");
    await page.getByRole("radio", { name: "Regular 20 XP" }).click();
    await page.getByRole("button", { name: "Start learning" }).press("Enter");
    await expect(page).toHaveURL(LESSON_1_URL);

    // AC 3: hearts in the lesson (HeartsLessonPlayer), then the LES-008/LES-010 results.
    await expect(page.getByTestId("lesson-hearts-meter")).toBeVisible();
    await expect(page.getByRole("img", { name: "Hearts: 5 of 5" })).toBeVisible();
    await playLesson1(page);
    await expect(page.getByTestId("celebration-banner")).toContainText("Streak started!");
    const stats = page.getByRole("list", { name: "Lesson stats" });
    await expect(stats.getByRole("listitem").nth(0)).toContainText("15");
    await expect(stats.getByRole("listitem").nth(3)).toContainText("Streak started!");
    await expect(stats.getByRole("listitem").nth(3)).toContainText("1 day");
    await expect(stats.getByRole("listitem").nth(4)).toContainText("Daily goal");
    await expect(stats.getByRole("listitem").nth(4)).toContainText("15 / 20 XP");

    // AC 6: "Continue" lands on Learn with the new values, no reload.
    await page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true));
    await page.getByRole("button", { name: "Continue" }).press("Enter");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("img", { name: /^Streak: 1 day/ })).toBeVisible();
    await expect(page.getByRole("img", { name: "Total XP: 15" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hearts: 5 of 5" })).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Daily goal" })).toBeVisible();
    await expect(page.getByText("15 / 20 XP")).toBeVisible();
    await expect(page.getByRole("link", { name: "Lesson 1: Hello!, completed" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Lesson 2: Nice to Meet You, up next" }),
    ).toBeVisible();
    await expect(page.getByText("1 of 5 lessons completed")).toBeVisible();
    expect(
      await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload),
    ).toBe(true);

    // AC 8: mid-unit Learn.
    await expectNoSeriousA11yViolations(page, LEARN_AXE);
  });

  test("AC 10 out of hearts: 1 heart, a wrong answer, then 0 hearts on Learn and the dialog", async ({
    page,
  }) => {
    await completeOnboarding(page);
    await seedHearts(page, 1);
    await expect(page.getByRole("button", { name: "Hearts: 1 of 5" })).toBeVisible();

    await page.getByRole("link", { name: "Lesson 1: Hello!, up next" }).click();
    await answerFirstExerciseWrong(page);
    const heading = page.getByRole("heading", { level: 1, name: OUT_OF_HEARTS });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();
    // AC 8: the out-of-hearts screen.
    await expectNoSeriousA11yViolations(page);

    await page.getByRole("link", { name: "Back to Learn" }).press("Enter");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("button", { name: "Hearts: 0 of 5" })).toBeVisible();
    // AC 8: Learn at 0 hearts.
    await expectNoSeriousA11yViolations(page, LEARN_AXE);

    // Activating Lesson 1 (keyboard) opens the dialog instead of the lesson.
    await page.getByRole("button", { name: "Lesson 1: Hello!, up next" }).press("Enter");
    const dialog = page.getByRole("dialog", { name: OUT_OF_HEARTS });
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
    await dialog.getByRole("button", { name: "OK" }).press("Enter");
    await expect(dialog).toHaveCount(0);
  });

  test("AC 4 locked deep link: Lesson 3's URL as a new learner lands on Learn with a toast", async ({
    page,
  }) => {
    await completeOnboarding(page);
    await page.goto("/lesson/u1-l3-at-the-cafe");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(LOCKED_TOAST)).toBeVisible();
    await expect(page.getByTestId("exercise-area")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Lesson 1: Hello!, up next" })).toBeVisible();

    // Available lessons still open; unknown ids still 404.
    await page.goto("/lesson/u1-l1-hello");
    await expect(
      page.getByTestId("exercise-area").getByRole("heading", { level: 2 }),
    ).toBeVisible();
    const response = await page.goto("/lesson/not-a-lesson");
    expect(response?.status()).toBe(404);
  });

  test("AC 1, 8, 9: new learner at 375 × 667: order, fit, sticky top bar, axe", async ({
    page,
  }) => {
    await completeOnboarding(page);
    const lastNode = page.getByRole("button", { name: "Lesson 5: Around Town, locked" });
    await expect(lastNode).toBeVisible();

    // UX empty state: 0-day streak, 0 XP, 5 hearts, "0 / 20 XP", Lesson 1 up next.
    await expect(page.getByRole("img", { name: "Streak: 0 days" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Total XP: 0" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hearts: 5 of 5" })).toBeVisible();
    await expect(page.getByText("0 / 20 XP")).toBeVisible();
    await expect(page.getByRole("link", { name: "Lesson 1: Hello!, up next" })).toBeVisible();

    // AC 1: one h1; top bar, then Lumi + ring, then the path. (The path scrolls its next
    // lesson into view on load; measure from the top.)
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    // Retried, in case the path's smooth scroll is still running.
    await expect
      .poll(() =>
        page.evaluate(() => {
          window.scrollTo({ top: 0, behavior: "instant" });
          return window.scrollY;
        }),
      )
      .toBe(0);
    const bar = (await topBar(page).boundingBox())!;
    const lumi = (await page.getByTestId("streak-lumi").boundingBox())!;
    const ring = (await page.getByRole("progressbar").boundingBox())!;
    const unit = (await page
      .getByRole("heading", { level: 2, name: "First Steps" })
      .boundingBox())!;
    expect(bar.y + bar.height).toBeLessThanOrEqual(lumi.y + 1);
    expect(Math.abs(lumi.y + lumi.height / 2 - (ring.y + ring.height / 2))).toBeLessThan(40);
    expect(lumi.x).toBeLessThan(ring.x);
    expect(ring.y + ring.height).toBeLessThanOrEqual(unit.y);

    // AC 9: no horizontal scrolling; the top bar stays while the path scrolls; the last
    // node clears the bottom nav.
    await expectNoHorizontalScroll(page);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: max, behavior: "instant" });
          return max > 0 && Math.abs(window.scrollY - max) <= 1;
        }),
      )
      .toBe(true);
    await expect(topBar(page)).toBeInViewport();
    const stuck = (await topBar(page).boundingBox())!;
    expect(stuck.y).toBeLessThanOrEqual(1);
    const navBox = (await nav(page).boundingBox())!;
    const lastBox = (await lastNode.boundingBox())!;
    expect(lastBox.y + lastBox.height).toBeLessThanOrEqual(navBox.y);

    // AC 8: new learner.
    await expectNoSeriousA11yViolations(page, LEARN_AXE);
  });
});
