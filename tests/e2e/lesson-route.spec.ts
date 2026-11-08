import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * PLT-007 (course loading, `/lesson/[lessonId]`, Learn list) and PLT-008 (results saved
 * on the device, "Completed" labels), with the real exercise registry (LES-004..007) and
 * the LES-008 results screen. Lesson 1 ("Hello!") of content/courses/en-es.
 */
const LESSON_1_URL = /\/lesson\/u1-l1-hello$/;
const FIRST_PROMPT = "Which one means 'hello'?";

type Step =
  | { kind: "choice"; answer: string }
  | { kind: "pairs"; pairs: [string, string][] }
  | { kind: "tiles"; tiles: string[] }
  | { kind: "listen"; tiles: string[] };

/** Lesson 1 in content order, answered correctly (so nothing is re-queued). */
const LESSON_1: Step[] = [
  { kind: "choice", answer: "Hola" },
  { kind: "choice", answer: "Buenos días" },
  {
    kind: "pairs",
    pairs: [
      ["hola", "hello"],
      ["adiós", "goodbye"],
      ["gracias", "thank you"],
      ["bien", "fine"],
      ["buenas noches", "good night"],
    ],
  },
  { kind: "tiles", tiles: ["hola", "cómo", "estás"] },
  { kind: "listen", tiles: ["buenos", "días"] },
  { kind: "choice", answer: "Gracias" },
  { kind: "tiles", tiles: ["fine", "thanks"] },
  { kind: "listen", tiles: ["buenas", "tardes", "cómo", "estás"] },
  { kind: "tiles", tiles: ["bien", "gracias", "adiós"] },
  { kind: "choice", answer: "Buenas tardes" },
  { kind: "tiles", tiles: ["good", "morning", "how", "are", "you"] },
  { kind: "listen", tiles: ["hola", "buenas", "noches"] },
];

async function addTiles(page: Page, tiles: string[]) {
  const bank = page.getByRole("group", { name: "Word bank" });
  for (const tile of tiles) {
    await bank
      .getByRole("button", { name: `Add ${tile}`, exact: true })
      .first()
      .click();
  }
}

/**
 * Plays Lesson 1 correctly to the results screen. Listen exercises are answered with
 * tiles; if the browser has no audio (placeholder clips, no speech voices), the
 * exercise offers "Skip" instead, which is never a mistake.
 */
async function playLesson1(page: Page) {
  await expect(page).toHaveURL(LESSON_1_URL);
  for (const step of LESSON_1) {
    await expect(
      page.getByTestId("exercise-area").getByRole("heading", { level: 2 }),
    ).toBeVisible();
    if (step.kind === "choice") {
      await page.getByRole("radio", { name: step.answer, exact: true }).click();
      await page.getByRole("button", { name: "Check" }).click();
    } else if (step.kind === "pairs") {
      for (const [learning, known] of step.pairs) {
        await page.getByRole("button", { name: learning, exact: true }).click();
        await page.getByRole("button", { name: known, exact: true }).click();
      }
    } else if (
      step.kind === "listen" &&
      (await page.getByRole("button", { name: "Skip" }).isVisible())
    ) {
      await page.getByRole("button", { name: "Skip" }).click();
      continue;
    } else {
      await addTiles(page, step.tiles);
      await page.getByRole("button", { name: "Check" }).click();
    }
    await page.getByRole("button", { name: "Continue" }).click();
  }
  await expect(page.getByRole("heading", { level: 1, name: "Lesson complete!" })).toBeVisible();
}

/** Waits until Learn has loaded the Unit 1 lesson chunks in the background. */
async function waitForLessonPreload(page: Page) {
  await page.waitForLoadState("networkidle");
}

test.describe("lesson route and lesson list (PLT-007)", () => {
  test("criteria 6 and 13: a new visitor completes onboarding and sees Lesson 1's first exercise", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: "Get started" }).click();
    await page.getByRole("radio", { name: "Spanish" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("radio", { name: "Casual 10 XP" }).click();
    await page.getByRole("button", { name: "Start learning" }).click();

    await expect(page).toHaveURL(LESSON_1_URL);
    await expect(page.getByRole("heading", { level: 2, name: FIRST_PROMPT })).toBeVisible();
    // Criterion 3: full screen, no bottom navigation.
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
  });

  test("criteria 4, 5, 11 and 12: Learn lists Unit 1 as an ordered list of lesson cards", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await completeOnboarding(page);
    await expect(page.getByRole("heading", { level: 2, name: "First Steps" })).toBeVisible();
    await expect(page.getByText("5 lessons")).toBeVisible();

    const list = page.locator("main ol");
    await expect(list.getByRole("listitem")).toHaveCount(5);
    const names = [
      "Lesson 1: Hello!",
      "Lesson 2: Nice to Meet You",
      "Lesson 3: At the Café",
      "Lesson 4: Count It",
      "Lesson 5: Around Town",
    ];
    for (const [index, name] of names.entries()) {
      await expect(list.getByRole("listitem").nth(index).getByRole("link")).toHaveAccessibleName(
        name,
      );
    }

    // 375 px: full-width cards, at least 56 px tall, the last one clears the bottom nav.
    const listBox = (await list.boundingBox())!;
    for (const card of await list.getByRole("listitem").all()) {
      const box = (await card.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(56);
      expect(Math.round(box.width)).toBe(Math.round(listBox.width));
    }
    const last = list.getByRole("listitem").last();
    // Scrolled to the end, the last card sits fully above the fixed bottom nav.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const navBox = (await page.getByRole("navigation", { name: "Main" }).boundingBox())!;
    expect((await last.boundingBox())!.y + (await last.boundingBox())!.height).toBeLessThanOrEqual(
      navBox.y,
    );

    await expectNoSeriousA11yViolations(page);

    // Keyboard: focus the card and press Enter.
    await page.getByRole("link", { name: "Lesson 2: Nice to Meet You" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/lesson\/u1-l2-nice-to-meet-you$/);
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
  });

  test("criterion 2: an unknown lesson id shows the 404 page", async ({ page }) => {
    const response = await page.goto("/lesson/not-a-lesson");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: "We couldn't find that page" }),
    ).toBeVisible();
  });

  test("criteria 7 and 13: after one online visit to Learn, Lesson 1 opens offline", async ({
    page,
    context,
  }) => {
    await completeOnboarding(page);
    await expect(page.getByRole("link", { name: "Lesson 1: Hello!" })).toBeVisible();
    await waitForLessonPreload(page);

    await context.setOffline(true);
    await page.getByRole("link", { name: "Lesson 1: Hello!" }).click();
    await expect(page).toHaveURL(LESSON_1_URL);
    await expect(page.getByRole("heading", { level: 2, name: FIRST_PROMPT })).toBeVisible();
    await context.setOffline(false);
  });
});

test.describe("results saved on the device (PLT-008)", () => {
  test("playing Lesson 1 to the end saves it: Completed label, Start again, kept after reload", async ({
    page,
  }) => {
    await completeOnboarding(page);
    await page.getByRole("link", { name: "Lesson 1: Hello!" }).click();
    await expect(page).toHaveURL(LESSON_1_URL);
    await playLesson1(page);
    // LES-008 results screen; its "Continue" goes back to Learn (no reload).
    await page.getByRole("button", { name: "Continue" }).click();

    // Criteria 5 and 6: the new label is there without a page reload.
    await expect(page).toHaveURL(/\/$/);
    const card = page.getByRole("link", { name: "Lesson 1: Hello!" });
    await expect(card).toHaveAccessibleDescription("Completed");
    await expect(
      page.getByRole("listitem").filter({ has: card }).getByText("Start again"),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Lesson 2: Nice to Meet You" }),
    ).not.toHaveAccessibleDescription("Completed");

    // Criterion 7: survives a reload.
    await page.reload();
    await expect(page.getByRole("link", { name: "Lesson 1: Hello!" })).toHaveAccessibleDescription(
      "Completed",
    );
  });

  test("a lesson finished offline is saved and labelled Completed", async ({ page, context }) => {
    await completeOnboarding(page);
    await expect(page.getByRole("link", { name: "Lesson 1: Hello!" })).toBeVisible();
    await waitForLessonPreload(page);

    await context.setOffline(true);
    await page.getByRole("link", { name: "Lesson 1: Hello!" }).click();
    await playLesson1(page);
    await expect(page.getByText("We couldn't save this lesson on your device.")).toHaveCount(0);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("link", { name: "Lesson 1: Hello!" })).toHaveAccessibleDescription(
      "Completed",
    );
    await context.setOffline(false);
  });
});
