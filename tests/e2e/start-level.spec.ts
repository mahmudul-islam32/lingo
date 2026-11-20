import { expect, test, type Locator, type Page } from "@playwright/test";
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
import { completeOnboarding } from "./onboarding-helpers";

/**
 * Start level and earning hearts (ADR-013, PD-064, PD-065) at 375 × 667, German course
 * (en-de: A1 and A2 have content). One spec for both tickets:
 * - GAM-011: the path ("Open" earlier lessons, "Start here" on locked level headers) and
 *   practice at 0 hearts on the path.
 * - PLT-025: the onboarding level step, the Profile "Start level" row and the lesson route.
 */
test.use({ viewport: { width: 375, height: 667 } });

const A1_FIRST = GERMAN_LESSON_1;
const A2_UNIT = GERMAN.units.find((unit) => unit.level === "A2")!;
const A2_FIRST = A2_UNIT.lessons[0]!;

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const node = (page: Page, title: string, state: "up next" | "open" | "completed" | "locked") =>
  page.getByRole(state === "locked" ? "button" : "link", {
    name: new RegExp(`^Unit \\d+, Lesson \\d+: ${escape(title)}, ${state}(?:\\.|$)`),
  });

/** Sets `settings.startLevel` on the device (test setup) and reloads. */
async function seedStartLevel(page: Page, startLevel: string): Promise<void> {
  await page.evaluate(
    (startLevel) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open("polyglow");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const tx = db.transaction("settings", "readwrite");
          const store = tx.objectStore("settings");
          const read = store.get("current");
          read.onsuccess = () => {
            if (!read.result) {
              reject(new Error("no settings stored yet: finish onboarding first"));
              return;
            }
            store.put({ ...read.result, startLevel }, "current");
          };
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    startLevel,
  );
  await page.reload();
}

/**
 * FIX-009: after the load-time auto-scroll, the current level's header card is not left
 * half under the sticky top bar, and the up-next node is fully visible between the bar
 * and the bottom nav.
 */
async function expectHeaderClearOfTopBar(page: Page, level: RegExp, upNext: Locator) {
  await expect(page.locator('[data-auto-scroll="settled"]')).toHaveCount(1);
  const bar = (await page.getByRole("region", { name: "Your progress" }).boundingBox())!;
  const header = (await page.getByRole("button", { name: level }).boundingBox())!;
  const barBottom = bar.y + bar.height;
  const hidden = header.y + header.height <= barBottom + 1;
  expect(hidden || header.y >= barBottom - 1, "header straddles the top bar").toBe(true);
  const node = (await upNext.boundingBox())!;
  const navTop = (await page.getByRole("navigation", { name: "Main" }).boundingBox())!.y;
  expect(node.y).toBeGreaterThanOrEqual(barBottom - 1);
  expect(node.y + node.height).toBeLessThanOrEqual(navTop + 1);
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("GAM-011 start level and practice", () => {
  test("AC 21: start level A2: A1 lessons are open, A2 L1 is up next (keyboard)", async ({
    page,
  }) => {
    await completeOnboarding(page);
    await seedStartLevel(page, "A2");

    const next = node(page, A2_FIRST.title, "up next");
    await expect(next).toBeVisible();
    // A2 is the current level; A1 opens with its header (Enter on the disclosure).
    const a1 = page.getByRole("button", { name: /^A1 · Beginner/ });
    await a1.focus();
    await page.keyboard.press("Enter");
    const open = node(page, A1_FIRST.title, "open");
    await expect(open).toBeVisible();
    await expect(open).toContainText("Open");
    await expectNoHorizontalScroll(page);
    // AC 19: no serious or critical axe violations with a skipped level.
    await expectNoSeriousA11yViolations(page);

    await open.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(lessonUrl(A1_FIRST.id));
  });

  test("AC 21: 'Start here' on the locked A2 header moves up next there (Tab, Enter)", async ({
    page,
  }) => {
    await completeOnboarding(page);
    await expect(node(page, A1_FIRST.title, "up next")).toBeVisible();
    const startHere = page.getByRole("button", { name: "Start here: A2 Elementary" });
    await expect(startHere).toBeVisible();
    const box = await startHere.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(48);
    await expectNoHorizontalScroll(page);

    // Keyboard only: Tab from the A2 level header reaches "Start here".
    await page.getByRole("button", { name: /^A2 · Elementary/ }).focus();
    await page.keyboard.press("Tab");
    await expect(startHere).toBeFocused();
    await page.keyboard.press("Enter");

    const next = node(page, A2_FIRST.title, "up next");
    await expect(next).toBeFocused();
    await expect(page.getByTestId("path-announcement")).toHaveText("Starting at A2 Elementary.");
    await expect(startHere).toHaveCount(0);

    // Saved on the device: still there after a reload.
    await page.reload();
    await expect(node(page, A2_FIRST.title, "up next")).toBeVisible();
  });

  test("PD-065: at 0 hearts a completed lesson still opens; a new one shows the dialog", async ({
    page,
  }) => {
    await completeOnboarding(page);
    await node(page, A1_FIRST.title, "up next").click();
    await playLesson(page, germanLesson1());
    // Wait for the result to be stored before leaving the results screen.
    await expect(page.getByText("Lesson saved.")).toBeAttached();
    await page.goto("/");
    await seedHearts(page, 0);
    await expect(page.getByRole("button", { name: "Hearts: 0 of 5" })).toBeVisible();

    const done = node(page, A1_FIRST.title, "completed");
    await expect(done).toContainText("Practice: earns hearts");

    const secondTitle = GERMAN.units[0]!.lessons[1]!.title;
    await page
      .getByRole("button", {
        name: new RegExp(`^Unit 1, Lesson 2: ${escape(secondTitle)}, up next`),
      })
      .press("Enter");
    const dialog = page.getByRole("dialog", { name: "You're out of hearts" });
    await expect(dialog).toContainText("Practise a finished lesson to earn hearts.");
    await dialog.getByRole("button", { name: "OK" }).press("Enter");
    await expect(dialog).toHaveCount(0);

    await done.press("Enter");
    await expect(page).toHaveURL(lessonUrl(A1_FIRST.id));
  });
});

const A2_LESSON_1 = A2_FIRST;
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
  // AC 5: onboarding opens the first lesson of the chosen level; the URL is caught as it
  // is opened.
  const openedA2 = page.waitForURL(lessonUrl(A2_LESSON_1.id), { waitUntil: "commit" });
  await page.keyboard.press("Enter");
  await openedA2;
}

test.describe("start level (PLT-025) at 375 px", () => {
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

  // Enabled with GAM-011 (computePathNodes honours startLevel).
  test("AC 5, 12, 17: an A2 starter has A2 L1 up next and its URL plays; a late A1 lesson plays", async ({
    page,
  }) => {
    test.slow();
    await onboardAtA2(page);
    await passTipCard(page);
    await expect(page).toHaveURL(lessonUrl(A2_LESSON_1.id));
    await page.goto("/");
    const upNext = page.getByRole("link", { name: nodeNamePattern(A2_LESSON_1, "up next") });
    await expect(upNext).toBeVisible();
    await expectHeaderClearOfTopBar(page, /^A2 · Elementary/, upNext);
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

  // Enabled with LES-020 (the player's practice flag).
  test("AC 18: at 0 hearts a completed lesson's URL opens the player with the Practice badge", async ({
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
