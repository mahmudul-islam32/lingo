import { expect, test } from "@playwright/test";
import { waitForServiceWorker } from "./helpers/service-worker";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * PLT-007 criterion 7 on a cold start: the service worker (PLT-002) precaches every
 * `/lesson/<id>` page and the lesson chunks, so a full page load of a lesson works with
 * the network off. PLT-009: locked lessons redirect to Learn (also offline), and Learn
 * renders progress offline (AC 7). Runs in the `pwa-prod` project (production build,
 * `next start`).
 */
test("lesson pages load offline after one online visit; locked ones redirect to Learn", async ({
  page,
  context,
}) => {
  await completeOnboarding(page);
  await waitForServiceWorker(page);
  await context.setOffline(true);

  await page.goto("/lesson/u1-l1-hello");
  await expect(page.getByTestId("exercise-area").getByRole("heading", { level: 2 })).toBeVisible();
  await expect(page.getByText("We couldn't load this lesson.")).toHaveCount(0);

  for (const id of [
    "u1-l2-nice-to-meet-you",
    "u1-l3-at-the-cafe",
    "u1-l4-count-it",
    "u1-l5-around-town",
  ]) {
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
  await expect(page.getByRole("link", { name: "Lesson 1: Hello!, up next" })).toBeVisible();
  await context.setOffline(false);
});
