import { expect, test } from "@playwright/test";
import { waitForServiceWorker } from "./helpers/service-worker";
import { GERMAN_LESSONS, GERMAN_LESSON_1, nodeNamePattern } from "./helpers/course";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * PLT-007 criterion 7 on a cold start: the service worker (PLT-002) precaches every
 * `/lesson/<id>` page and the lesson chunks, so a full page load of a lesson works with
 * the network off. PLT-009: locked lessons redirect to Learn (also offline), and Learn
 * renders progress offline (AC 7). Runs in the `pwa-prod` project (production build,
 * `next start`). Since PLT-024 with the German course (ids from `content/courses/en-de`).
 */
test("lesson pages load offline after one online visit; locked ones redirect to Learn", async ({
  page,
  context,
}) => {
  await completeOnboarding(page);
  await waitForServiceWorker(page);
  await context.setOffline(true);

  await page.goto(`/lesson/${GERMAN_LESSON_1.id}`);
  await expect(page.getByTestId("exercise-area").getByRole("heading", { level: 2 })).toBeVisible();
  await expect(page.getByText("We couldn't load this lesson.")).toHaveCount(0);

  // The rest of Unit 1 and the last A1 lesson are locked for a new learner.
  for (const id of [...GERMAN_LESSONS.slice(1, 5), GERMAN_LESSONS.at(-1)!].map((l) => l.id)) {
    await page.goto(`/lesson/${id}`);
    await expect(page, id).toHaveURL(/\/$/);
    await expect(page.getByText("Finish the earlier lessons first.")).toBeVisible();
  }
  await context.setOffline(false);
});

test("PLT-009 AC 7: Learn renders streak, XP, hearts, goal and path offline", async ({
  page,
  context,
}) => {
  await completeOnboarding(page);
  await waitForServiceWorker(page);
  await context.setOffline(true);

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeAttached();
  await expect(page.getByRole("img", { name: "Streak: 0 days" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Total XP: 0" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hearts: 5 of 5" })).toBeVisible();
  await expect(page.getByText("0 / 20 XP")).toBeVisible();
  await expect(
    page.getByRole("link", { name: nodeNamePattern(GERMAN_LESSON_1, "up next") }),
  ).toBeVisible();
  await context.setOffline(false);
});
