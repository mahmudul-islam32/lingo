import { expect, type Page } from "@playwright/test";

/** Lesson 1 ("Hello!") of `content/courses/en-es` (CON-001). */
export const LESSON_1_URL = /\/lesson\/u1-l1-hello$/;
export const LESSON_1_FIRST_PROMPT = "Which one means 'hello'?";

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
export async function playLesson1(page: Page): Promise<void> {
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

/** Answers Lesson 1's first exercise wrong and continues past the feedback. */
export async function answerFirstExerciseWrong(page: Page): Promise<void> {
  await expect(page).toHaveURL(LESSON_1_URL);
  await expect(page.getByRole("heading", { level: 2, name: LESSON_1_FIRST_PROMPT })).toBeVisible();
  await page.getByRole("radio", { name: "Gracias", exact: true }).click();
  await page.getByRole("button", { name: "Check" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
}
