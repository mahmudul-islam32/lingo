import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";
import {
  GERMAN,
  GERMAN_LESSON_1,
  germanLesson1,
  lessonUrl,
  nodeNamePattern,
  passTipCard,
  playLesson,
} from "./helpers/course";
import { seedHearts } from "./helpers/seed";

/**
 * PLT-025 (ADR-013, PD-064, PD-065): a learner chooses a start level in onboarding and
 * changes it in Profile; the lesson route follows the same path rule.
 *
 * Parts that need GAM-011 (`computePathNodes` honouring `startLevel`) or LES-020 (the
 * player's practice flag) are `test.fixme` until those merge. cto: enable them after the
 * GAM-011 and LES-020 merges (search for "PLT-025 fixme").
 */
const A2_UNIT = GERMAN.units.find((u) => u.level === "A2")!;
const A2_LESSON_1 = A2_UNIT.lessons[0]!;
const A1_LAST = GERMAN.units
  .filter((u) => u.level === "A1")
  .at(-1)!
  .lessons.at(-1)!;
const h1 = (page: Page) => page.getByRole("heading", { level: 1 });

/** `settings.startLevel` as stored on the device (Dexie `settings`, key "current"). */
function storedStartLevel(page: Page): Promise<string | undefined> {
  return page.evaluate(
    () =>
      new Promise<string | undefined>((resolve, reject) => {
        const open = indexedDB.open("polyglow");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const read = db.transaction("settings").objectStore("settings").get("current");
          read.onsuccess = () => {
            db.close();
            resolve((read.result as { startLevel?: string } | undefined)?.startLevel);
          };
          read.onerror = () => reject(read.error);
        };
      }),
  );
}

/** Keyboard-only onboarding choosing A2 · Elementary; returns once the A2 URL was opened. */
async function onboardAtA2(page: Page) {
  await page.goto("/onboarding");
  await expect(page.getByRole("button", { name: "Get started" })).toBeVisible();
  await page.getByRole("button", { name: "Get started" }).focus();
  await page.keyboard.press("Enter");
  await expect(h1(page)).toHaveText("What do you want to learn?");
  await expect(page.getByRole("radio", { name: "German" })).toBeChecked();
  await page.keyboard.press("Tab"); // German
  await page.keyboard.press("Tab"); // Continue
  await page.keyboard.press("Enter");

  await expect(h1(page)).toHaveText("Where do you want to start?");
  await expect(page.getByRole("radio", { name: "A1 · Beginner" })).toBeChecked();
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio", { name: "A2 · Elementary" })).toBeChecked();
  await expect(page.getByRole("radio", { name: "A2 · Elementary" })).toBeFocused();
  // AC 15, 16: axe clean, no horizontal scroll at 375 px.
  await expectNoSeriousA11yViolations(page);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(0);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Continue" })).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(h1(page)).toHaveText("Choose a daily goal");
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowDown"); // Regular 20 XP
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Start learning" })).toBeFocused();
  // AC 5: onboarding opens the first lesson of the chosen level (it may then redirect,
  // see the fixme below), so the URL is caught as it is opened.
  const openedA2 = page.waitForURL(lessonUrl(A2_LESSON_1.id), { waitUntil: "commit" });
  await page.keyboard.press("Enter");
  await openedA2;
}

test.describe("start level (PLT-025) at 375 px", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("AC 5, 7–10, 17: onboard at A2, A1 lessons stay playable, change back to A1 in Profile", async ({
    page,
  }) => {
    test.slow();
    await onboardAtA2(page);
    await expect.poll(() => storedStartLevel(page)).toBe("A2");

    // An earlier-level (A1) lesson stays playable.
    await page.goto(`/lesson/${GERMAN_LESSON_1.id}`);
    await passTipCard(page);
    await expect(page).toHaveURL(lessonUrl(GERMAN_LESSON_1.id));

    // Profile shows the level and changes it with the keyboard.
    await page.goto("/profile");
    await expect(page.getByTestId("start-level-value")).toHaveText("A2 · Elementary");
    const change = page.getByRole("button", { name: "Change start level" });
    await change.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Change start level" });
    await expect(dialog).toBeVisible();
    // Escape changes nothing; focus returns to Change.
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(change).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(dialog.getByRole("radio", { name: "A2 · Elementary" })).toBeChecked();
    await dialog.getByRole("radio", { name: "A2 · Elementary" }).focus();
    await page.keyboard.press("ArrowUp");
    await expect(dialog.getByRole("radio", { name: "A1 · Beginner" })).toBeChecked();
    await expect(
      dialog.getByText("Lessons you haven't finished in earlier levels will lock again."),
    ).toBeVisible();
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((a) => a.effect?.getTiming().iterations !== Infinity)
          .map((a) => a.finished),
      ),
    );
    await expectNoSeriousA11yViolations(page);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(0);
    await dialog.getByRole("button", { name: "Save" }).focus();
    await page.keyboard.press("Enter");
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId("start-level-value")).toHaveText("A1 · Beginner");
    await expect.poll(() => storedStartLevel(page)).toBe("A1");

    // AC 11: survives a reload.
    await page.reload();
    await expect(page.getByTestId("start-level-value")).toHaveText("A1 · Beginner");

    // AC 17: back at A1, the A2 L1 URL redirects to Learn (PD-018).
    await page.goto(`/lesson/${A2_LESSON_1.id}`);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("Finish the earlier lessons first.")).toBeVisible();
  });

  // PLT-025 fixme: needs GAM-011's computePathNodes(…, startLevel). cto: enable after merge.
  test.fixme("AC 5, 12, 17: an A2 starter has A2 L1 up next and its URL plays; a late A1 lesson plays", async ({
    page,
  }) => {
    test.slow();
    await onboardAtA2(page);
    await passTipCard(page);
    await expect(page).toHaveURL(lessonUrl(A2_LESSON_1.id));
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: nodeNamePattern(A2_LESSON_1, "up next") }),
    ).toBeVisible();
    await page.goto(`/lesson/${A1_LAST.id}`);
    await passTipCard(page);
    await expect(page).toHaveURL(lessonUrl(A1_LAST.id));
  });

  test("AC 18: at 0 hearts a not-completed lesson's URL shows the out-of-hearts screen", async ({
    page,
  }) => {
    await onboardAtA2(page);
    await page.goto("/");
    await seedHearts(page, 0);
    await page.goto(`/lesson/${GERMAN_LESSON_1.id}`);
    await expect(h1(page)).toHaveText("You're out of hearts");
  });

  // PLT-025 fixme: needs LES-020's practice flag in HeartsLessonPlayer. cto: enable after merge.
  test.fixme("AC 18: at 0 hearts a completed lesson's URL opens the player with the Practice badge", async ({
    page,
  }) => {
    test.slow();
    await onboardAtA2(page);
    await page.goto(`/lesson/${GERMAN_LESSON_1.id}`);
    await playLesson(page, germanLesson1());
    await page.getByRole("button", { name: "Continue" }).click();
    await seedHearts(page, 0);
    await page.goto(`/lesson/${GERMAN_LESSON_1.id}`);
    await expect(page.getByText("Practice: wrong answers cost no hearts")).toBeAttached();
    await passTipCard(page);
  });
});
