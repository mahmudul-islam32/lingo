import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "../e2e/axe";
import { GERMAN_LESSONS, playLesson, readLesson } from "../e2e/helpers/course";
import { completeOnboarding } from "../e2e/onboarding-helpers";
import {
  PASSWORD,
  SERVICE_ROLE_KEY,
  createConfirmedUser,
  signIn,
  uniqueEmail,
} from "./local-supabase";
import { waitForAuthLink } from "./helpers/mail";
import {
  accessToken,
  germanResult,
  insertServerResults,
  logIn,
  patchDeviceSettings,
  progressView,
  seedDeviceResults,
  serverRows,
  signUpAndConfirm,
} from "./helpers/progress";
import { requireLocalStack } from "./helpers/stack";

/**
 * PLT-013 against the LOCAL Supabase stack: the "Save your progress" prompt after the
 * first lesson, the guest → account migration with nothing lost (criterion 7), and the
 * union into an existing account (criterion 11, checked in the database until PLT-015).
 */
requireLocalStack();
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });

const lesson = (i: number) => readLesson("en-de", GERMAN_LESSONS[i]!.id);

test("the prompt opens after the 1st lesson's Continue, Not now dismisses it", async ({ page }) => {
  await completeOnboarding(page);
  await page.goto(`/lesson/${GERMAN_LESSONS[0]!.id}`);
  await playLesson(page, lesson(0));
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Continue" }).click();

  const dialog = page.getByRole("dialog", { name: "Save your progress" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(
    "Create an account to keep your XP, streak and goal date on every device.",
  );
  await expect(dialog.getByRole("link", { name: "Create account" })).toHaveAttribute(
    "href",
    "/sign-up",
  );
  // Fits at 375 × 667 without scrolling; 48 px buttons.
  const box = (await dialog.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(667);
  for (const control of await dialog.locator("a, button").all()) {
    expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  }
  await expectNoSeriousA11yViolations(page);

  await dialog.getByRole("button", { name: "Not now" }).click();
  await expect(dialog).toHaveCount(0);

  // The 2nd lesson: no prompt.
  await page.goto(`/lesson/${GERMAN_LESSONS[1]!.id}`);
  await playLesson(page, lesson(1));
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("sign-up migrates the guest: nothing is lost (criterion 7)", async ({ page }) => {
  await completeOnboarding(page);
  for (const i of [0, 1]) {
    await page.goto(`/lesson/${GERMAN_LESSONS[i]!.id}`);
    await playLesson(page, lesson(i));
    await page.getByRole("button", { name: "Continue" }).click();
    await page
      .getByRole("button", { name: "Not now" })
      .click({ timeout: 2_000 })
      .catch(() => {});
  }
  await patchDeviceSettings(page, {
    startLevel: "A1",
    goalPlans: { "en-de": { targetLevel: "A2", targetDate: "2027-09-01" } },
  });
  const before = await progressView(page);

  const email = uniqueEmail("plt013-migrate");
  await signUpAndConfirm(page, email, PASSWORD, (e) => waitForAuthLink(e, "signup"));
  await expect(page.getByRole("status").filter({ hasText: "Your progress is saved." })).toBeVisible(
    {
      timeout: 20_000,
    },
  );
  await expectNoSeriousA11yViolations(page);
  await page.getByRole("link", { name: "Continue" }).click();

  expect(await progressView(page)).toEqual(before);
  await page.reload();
  expect(await progressView(page)).toEqual(before);

  const token = (await accessToken(page))!;
  const results = await serverRows(token, "lesson_results", "id,lesson_id,xp_earned");
  expect(results).toHaveLength(2);
  const [settings] = await serverRows<{ start_level: string; goal_plans: unknown }>(
    token,
    "settings",
    "start_level,goal_plans",
  );
  expect(settings).toEqual({
    start_level: "A1",
    goal_plans: { "en-de": { targetLevel: "A2", targetDate: "2027-09-01" } },
  });
  // Idempotent: the device is an account now and never migrates again (criterion 10).
  await page.reload();
  expect(await serverRows(token, "lesson_results", "id")).toHaveLength(2);
});

test.describe("into an existing account (criterion 11)", () => {
  test.skip(
    !SERVICE_ROLE_KEY && process.env.ACCOUNTS_REQUIRED !== "1",
    "SUPABASE_SERVICE_ROLE_KEY (local stack only) is not set",
  );

  test("results are unioned and total XP is the sum of all four", async ({ page }) => {
    const email = uniqueEmail("plt013-union");
    await createConfirmedUser(email);
    const token = await signIn(email);
    const a = germanResult(0, "2026-11-20T10:00:00Z");
    const b = germanResult(1, "2026-11-20T10:10:00Z", { base: 10, bonus: 5 });
    await insertServerResults(token, [a, b]);

    await completeOnboarding(page);
    const b2 = germanResult(1, "2026-11-27T09:00:00Z");
    const c = germanResult(2, "2026-11-27T09:10:00Z", { base: 10, bonus: 5 });
    await seedDeviceResults(page, [b2, c]);

    await logIn(page, email, PASSWORD);
    await expect(
      page.getByRole("status").filter({ hasText: "Your progress is saved." }),
    ).toBeVisible({
      timeout: 20_000,
    });
    const rows = await serverRows<{ id: string; xp_earned: number }>(
      token,
      "lesson_results",
      "id,xp_earned",
    );
    expect(rows.map((r) => r.id).sort()).toEqual([a.id, b.id, b2.id, c.id].sort());
    expect(rows.reduce((sum, r) => sum + r.xp_earned, 0)).toBe(10 + 15 + 10 + 15);
  });
});
