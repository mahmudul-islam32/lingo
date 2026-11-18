import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";
import { GERMAN, GERMAN_LESSON_1, germanLesson1, lessonUrl, playLesson } from "./helpers/course";
import { seedHearts } from "./helpers/seed";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * GAM-011 (ADR-013, PD-064, PD-065) at 375 × 667: the start level on the path ("Open"
 * earlier lessons, "Start here" on locked level headers) and practice at 0 hearts.
 * German course (en-de): A1 and A2 have content.
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
