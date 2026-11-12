import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * PLT-007 criterion 7 on a cold start: the service worker (PLT-002) precaches every
 * `/lesson/<id>` page and the lesson chunks, so a full page load of a lesson works with
 * the network off. Runs in the `pwa-prod` project (production build, `next start`).
 */
/** Lesson ids of a bundled course, read from its manifest (en-de is pm content). */
function manifestLessonIds(courseId: string): string[] {
  const path = join(process.cwd(), "content", "courses", courseId, "course.json");
  const course = JSON.parse(readFileSync(path, "utf8")) as {
    units: { lessons: { id: string }[] }[];
  };
  return course.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id));
}

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
    // CTO-008: the default German course is precached too (first five lessons, to stay fast).
    ...manifestLessonIds("en-de").slice(0, 5),
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
