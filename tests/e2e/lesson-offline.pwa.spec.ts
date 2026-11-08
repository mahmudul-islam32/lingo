import { expect, test, type Page } from "@playwright/test";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * PLT-007 criterion 7 on a cold start: the service worker (PLT-002) precaches every
 * `/lesson/<id>` page and the lesson chunks, so a full page load of a lesson works with
 * the network off. Runs in the `pwa-prod` project (production build, `next start`).
 */
async function waitForServiceWorker(page: Page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
}

test("every Unit 1 lesson page loads offline after one online visit", async ({ page, context }) => {
  await completeOnboarding(page);
  await waitForServiceWorker(page);
  await context.setOffline(true);

  for (const id of [
    "u1-l1-hello",
    "u1-l2-nice-to-meet-you",
    "u1-l3-at-the-cafe",
    "u1-l4-count-it",
    "u1-l5-around-town",
  ]) {
    await page.goto(`/lesson/${id}`);
    await expect(
      page.getByTestId("exercise-area").getByRole("heading", { level: 2 }),
      id,
    ).toBeVisible();
    await expect(page.getByText("We couldn't load this lesson.")).toHaveCount(0);
  }
  await context.setOffline(false);
});
