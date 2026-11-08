import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * PLT-007 (course loading, `/lesson/[lessonId]`, Learn list) and PLT-008 (results saved
 * on the device, "Completed" labels). Lesson 1 ("Hello!") of content/courses/en-es.
 *
 * Exercise types on main: multiple choice (LES-004) and match pairs (LES-006). Word bank
 * (LES-005) and listen (LES-007) are not registered yet, so the player leaves them out;
 * `playLesson1` answers whatever is shown and needs an update once they land.
 */
const LESSON_1_URL = /\/lesson\/u1-l1-hello$/;
const FIRST_PROMPT = "Which one means 'hello'?";

const MULTIPLE_CHOICE_ANSWERS: Record<string, string> = {
  "Which one means 'hello'?": "Hola",
  "Which one means 'good morning'?": "Buenos días",
  "Which one means 'gracias'?": "Thank you",
  "Which one means 'good afternoon'?": "Buenas tardes",
};
const PAIRS: [string, string][] = [
  ["hola", "hello"],
  ["adiós", "goodbye"],
  ["gracias", "thank you"],
  ["bien", "fine"],
  ["buenas noches", "good night"],
];

/** Answers every exercise of Lesson 1 correctly until the player hands back to Learn. */
async function playLesson1(page: Page) {
  await expect(page).toHaveURL(LESSON_1_URL);
  const learn = page.getByRole("heading", { level: 1, name: "Learn" });
  const prompt = page.getByTestId("exercise-area").getByRole("heading", { level: 2 });
  for (let step = 0; step < 20; step += 1) {
    await expect(learn.or(prompt)).toBeVisible();
    if (await learn.isVisible()) return;
    const text = ((await prompt.textContent()) ?? "").trim();
    if (text === "Match the pairs") {
      for (const [learning, known] of PAIRS) {
        await page.getByRole("button", { name: learning, exact: true }).click();
        await page.getByRole("button", { name: known, exact: true }).click();
      }
    } else {
      const answer = MULTIPLE_CHOICE_ANSWERS[text];
      expect(answer, `answer for "${text}"`).toBeDefined();
      await page.getByRole("radio", { name: answer!, exact: true }).click();
      await page.getByRole("button", { name: "Check" }).click();
    }
    await page.getByRole("button", { name: "Continue" }).click();
    // Prompts in Lesson 1 are unique, so the old one disappears when the next one shows.
    await expect(prompt.filter({ hasText: text })).toHaveCount(0);
  }
  throw new Error("Lesson 1 did not finish");
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
    await last.scrollIntoViewIfNeeded();
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

    // Back on Learn without a reload: toast + label (criteria 5 and 6).
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("Lesson complete!")).toBeVisible();
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
    await expect(page.getByRole("link", { name: "Lesson 1: Hello!" })).toHaveAccessibleDescription(
      "Completed",
    );
    await context.setOffline(false);
  });
});
