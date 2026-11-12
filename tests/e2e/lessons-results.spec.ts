import { expect, test, type Page } from "@playwright/test";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * LES-008 criteria 10 and 12: the routed results flow with CON-001 content, keyboard only.
 * LES-010 criterion 15: a new guest's first lesson shows "Streak started!", "1 day" and
 * "15 / 20 XP" (default goal 20), and the whole screen (banner and both rows included)
 * still fits 375 × 667.
 * Lesson 1 ("Hello!") of `content/courses/en-es` Unit 1 is played on `/lesson/[lessonId]`
 * (PLT-007) and the result is saved on the device (PLT-008).
 *
 * (File named `lessons-results.spec.ts`, not the ticket's `lesson-results.spec.ts`, so it
 * matches dev-lessons' `tests/e2e/lessons*` ownership.)
 */

type Step =
  | { kind: "choice"; answer: string }
  | { kind: "pairs"; pairs: [string, string][] }
  | { kind: "tiles"; tiles: string[] }
  | { kind: "listen"; tiles: string[] };

/** Lesson 1 in content order, answered correctly. */
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

const FIRST_PROMPT = "Which one means 'hello'?";

/** Keyboard activation: focus the control, then press the key. */
async function press(page: Page, name: string, key = "Enter") {
  const button = page.getByRole("button", { name, exact: true }).first();
  await button.focus();
  await button.press(key);
}

async function check(page: Page) {
  await press(page, "Check");
}

async function choose(page: Page, answer: string) {
  const radio = page.getByRole("radio", { name: answer, exact: true });
  await radio.focus();
  await radio.press("Space");
  await expect(radio).toBeChecked();
}

async function playStep(page: Page, step: Step) {
  await expect(page.getByTestId("exercise-area").getByRole("heading", { level: 2 })).toBeVisible();
  if (step.kind === "choice") {
    await choose(page, step.answer);
    await check(page);
  } else if (step.kind === "pairs") {
    for (const [learning, known] of step.pairs) {
      await press(page, learning);
      await press(page, known);
    }
  } else if (
    step.kind === "listen" &&
    (await page.getByRole("button", { name: "Skip" }).isVisible())
  ) {
    // No audio in headless Chromium (placeholder clips, no voices): "Skip" is never a mistake.
    await press(page, "Skip");
    return;
  } else {
    const bank = page.getByRole("group", { name: "Word bank" });
    for (const tile of step.tiles) {
      const button = bank.getByRole("button", { name: `Add ${tile}`, exact: true }).first();
      await button.focus();
      await button.press("Enter");
    }
    await check(page);
  }
  await press(page, "Continue");
}

async function startLesson1(page: Page) {
  await completeOnboarding(page);
  const card = page.getByRole("link", { name: "Lesson 1: Hello!" });
  await card.focus();
  await card.press("Enter");
  await expect(page).toHaveURL(/\/lesson\/u1-l1-hello$/);
}

test.describe("LES-008 lesson results", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("all answers correct: 15 XP and 100 %, everything visible without scrolling", async ({
    page,
  }) => {
    await startLesson1(page);
    for (const step of LESSON_1) await playStep(page, step);

    const heading = page.getByRole("heading", { level: 1, name: "Lesson complete!" });
    await expect(heading).toBeFocused();
    const stats = page.getByRole("list", { name: "Lesson stats" });
    await expect(stats.getByRole("listitem").nth(0)).toContainText("XP earned");
    await expect(stats.getByRole("listitem").nth(0)).toContainText("15");
    await expect(stats.getByRole("listitem").nth(1)).toContainText("100 %");
    await expect(page.getByText("Perfect lesson! +5 bonus XP")).toBeVisible();
    // LES-010 AC 15: first lesson of a new guest (default goal 20).
    const banner = page.getByTestId("celebration-banner");
    await expect(banner).toContainText("Streak started!");
    await expect(banner).toBeInViewport();
    await expect(stats.getByRole("listitem")).toHaveCount(5);
    await expect(stats.getByRole("listitem").nth(3)).toContainText("Streak started!");
    await expect(stats.getByRole("listitem").nth(3)).toContainText("1 day");
    await expect(stats.getByRole("listitem").nth(4)).toContainText("Daily goal");
    await expect(stats.getByRole("listitem").nth(4)).toContainText("15 / 20 XP");
    await expect(stats.getByRole("listitem").nth(4)).toBeInViewport();
    // Criterion 10 (LES-008) / 12 (LES-010): no scrolling needed at 375 × 667.
    const continueButton = page.getByRole("button", { name: "Continue" });
    await expect(continueButton).toBeInViewport();
    const scrolls = await page.evaluate(
      () => document.documentElement.scrollHeight > window.innerHeight,
    );
    expect(scrolls).toBe(false);
    await continueButton.focus();
    await continueButton.press("Enter");
    await expect(page).toHaveURL(/\/$/);
  });

  test("one mistake: the exercise comes back at the end and the lesson earns 10 XP", async ({
    page,
  }) => {
    await startLesson1(page);
    // 1. Answer the first exercise wrong, continue.
    await expect(page.getByRole("heading", { level: 2, name: FIRST_PROMPT })).toBeVisible();
    await choose(page, "Adiós");
    await check(page);
    await press(page, "Continue");
    // 2. Answer the rest correctly.
    for (const step of LESSON_1.slice(1)) await playStep(page, step);
    // 3. The missed exercise is shown again last; answer it correctly.
    await expect(page.getByRole("heading", { level: 2, name: FIRST_PROMPT })).toBeVisible();
    await playStep(page, LESSON_1[0]!);

    await expect(page.getByRole("heading", { level: 1, name: "Lesson complete!" })).toBeVisible();
    const stats = page.getByRole("list", { name: "Lesson stats" });
    await expect(stats.getByRole("listitem").nth(0)).toContainText("10");
    await expect(page.getByText(/Perfect lesson!/)).toHaveCount(0);
  });
});
