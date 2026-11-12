import { expect, test } from "@playwright/test";

/**
 * LES-008 criteria 10 and 12: the routed results flow with CON-001 content, keyboard only.
 * LES-010 criterion 15: a new guest's first lesson shows "Streak started!", "1 day" and
 * "15 / 20 XP" (default goal 20), and the whole screen (banner and both rows included)
 * still fits 375 × 667.
 *
 * FIXME: needs the lesson route (`/lesson/[lessonId]`, PLT-007), onboarding and the
 * device storage that saves results (PLT-008). Until those land on `main` there is no
 * page to drive, so the tests are `test.fixme`. The steps below are the intended flow;
 * the answer key comes from `content/courses/en-es` Unit 1, Lesson 1.
 *
 * (File named `lessons-results.spec.ts`, not the ticket's `lesson-results.spec.ts`, so it
 * matches dev-lessons' `tests/e2e/lessons*` ownership.)
 */
test.describe("LES-008 lesson results", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.fixme("all answers correct: 15 XP and 100 %, everything visible without scrolling", async ({
    page,
  }) => {
    await page.goto("/");
    // 1. Finish onboarding as a new guest with the keyboard (PLT-003/PLT-00x).
    // 2. Start Lesson 1 from Learn and answer every exercise correctly (Tab/Enter only).
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
    await continueButton.press("Enter");
    await expect(page).toHaveURL("/");
  });

  test.fixme("one mistake: the exercise comes back at the end and the lesson earns 10 XP", async ({
    page,
  }) => {
    await page.goto("/");
    // 1. Onboard as a new guest, start Lesson 1.
    // 2. Answer the first exercise wrong, continue, answer the rest correctly.
    // 3. The wrong exercise is shown again last; answer it correctly.
    const stats = page.getByRole("list", { name: "Lesson stats" });
    await expect(stats.getByRole("listitem").nth(0)).toContainText("10");
    await expect(page.getByText(/Perfect lesson!/)).toHaveCount(0);
  });
});
