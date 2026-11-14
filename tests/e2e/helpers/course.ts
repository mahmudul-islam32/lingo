import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";

/**
 * PLT-024: e2e specs read lesson ids, titles and answers from the bundled course files
 * (`content/courses/<courseId>/…`), never hard-coding the pm's content. The types below
 * are the subset of the contract shapes the specs need (the JSON is validated against
 * the real contracts by the content tests).
 */
export interface CourseLessonJson {
  id: string;
  title: string;
}
export interface CourseUnitJson {
  id: string;
  title: string;
  level?: string;
  lessons: CourseLessonJson[];
}
export interface CourseJson {
  id: string;
  title: string;
  learningLanguage: string;
  units: CourseUnitJson[];
}

type ExerciseJson =
  | {
      id: string;
      type: "multiple_choice";
      prompt: string;
      options: { id: string; text: string }[];
      correctOptionId: string;
    }
  | { id: string; type: "match_pairs"; pairs: { learning: string; known: string }[] }
  | { id: string; type: "word_bank_translate"; prompt: string; tiles: string[]; answers: string[] }
  | { id: string; type: "listen"; tiles: string[]; answers: string[] }
  | { id: string; type: "speak"; phrase: string };

export interface LessonJson {
  id: string;
  courseId: string;
  unitId: string;
  title: string;
  exercises: ExerciseJson[];
}

const CONTENT_DIR = path.join(process.cwd(), "content", "courses");

function readJson<T>(...parts: string[]): T {
  return JSON.parse(readFileSync(path.join(CONTENT_DIR, ...parts), "utf8")) as T;
}

export function readCourse(courseId: string): CourseJson {
  return readJson<CourseJson>(courseId, "course.json");
}

export function readLesson(courseId: string, lessonId: string): LessonJson {
  return readJson<LessonJson>(courseId, "lessons", `${lessonId}.json`);
}

/** Every lesson in path order, with its 1-based number across units (GAM-008 names). */
export function courseLessons(course: CourseJson) {
  return course.units
    .flatMap((unit) => unit.lessons.map((lesson) => ({ ...lesson, unit })))
    .map((lesson, index) => ({ ...lesson, number: index + 1 }));
}

/** The default course (`en-de`, CTO-008) and its first A1 lesson. */
export const GERMAN = readCourse("en-de");
export const GERMAN_LESSONS = courseLessons(GERMAN);
export const GERMAN_LESSON_1 = GERMAN_LESSONS[0]!;

/** The hidden Spanish course (`en-es`), kept for existing guests (PD-030, PLT-024 AC 8). */
export const SPANISH = readCourse("en-es");

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** `/lesson/<id>` as an exact URL pattern. */
export function lessonUrl(lessonId: string): RegExp {
  return new RegExp(`/lesson/${escapeRegex(lessonId)}$`);
}

/**
 * Regex for a path node's accessible name in one state, matched by title, e.g.
 * "Lesson 1: Hello and Goodbye, up next. Start". It accepts both the GAM-008 names
 * ("Lesson N: …") and GAM-010's German names with a unit ("Unit N, Lesson M: …"), so the
 * specs don't depend on the numbering scheme. Titles are unique within a course.
 */
export function nodeNamePattern(
  lesson: { title: string },
  state: "up next" | "completed" | "locked",
): RegExp {
  return new RegExp(
    `^(?:Unit \\d+, )?Lesson \\d+: ${escapeRegex(lesson.title)}, ${state}(?:\\.|$)`,
  );
}

/** Lower-cased words without punctuation (the PD-010/ADR-008 comparison, simplified). */
function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[-–]/g, " ")
    .replace(/[.,!?;:¿¡„“”"«»‹›…]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Tiles, in order, that build `answer` (each tile used at most once), or `null`. */
export function tilesFor(answer: string, tiles: readonly string[]): string[] | null {
  const target = words(answer);
  const tileWords = tiles.map(words);
  const used = new Set<number>();
  const solve = (at: number): string[] | null => {
    if (at === target.length) return [];
    for (const [index, tw] of tileWords.entries()) {
      if (used.has(index) || tw.length === 0) continue;
      if (!tw.every((w, k) => target[at + k] === w)) continue;
      used.add(index);
      const rest = solve(at + tw.length);
      if (rest) return [tiles[index]!, ...rest];
      used.delete(index);
    }
    return null;
  };
  return solve(0);
}

export interface PlayOptions {
  /** Keyboard only: focus each control and press Enter/Space (LES-008, PLT-024 AC 12). */
  keyboard?: boolean;
}

async function activate(page: Page, name: string, keyboard: boolean, scope: Page | Locator = page) {
  const button = scope.getByRole("button", { name, exact: true }).first();
  if (keyboard) {
    await button.focus();
    await button.press("Enter");
  } else {
    await button.click();
  }
}

async function choose(page: Page, text: string, keyboard: boolean) {
  const radio = page.getByRole("radio", { name: text, exact: true });
  if (keyboard) {
    await radio.focus();
    await radio.press("Space");
  } else {
    await radio.click();
  }
  await expect(radio).toBeChecked();
}

/** Answers one exercise correctly and continues past the feedback. */
export async function answerCorrectly(
  page: Page,
  exercise: ExerciseJson,
  { keyboard = false }: PlayOptions = {},
): Promise<void> {
  await expect(page.getByTestId("exercise-area").getByRole("heading", { level: 2 })).toBeVisible();
  // No audio in headless Chromium (placeholder clips, no voices): a listen exercise offers
  // "Skip" instead, which is never a mistake. Otherwise it is answered with tiles.
  if (
    exercise.type === "listen" &&
    (await page.getByRole("button", { name: "Skip" }).isVisible())
  ) {
    await activate(page, "Skip", keyboard);
    return;
  }
  switch (exercise.type) {
    case "multiple_choice": {
      const correct = exercise.options.find((o) => o.id === exercise.correctOptionId)!;
      await choose(page, correct.text, keyboard);
      await activate(page, "Check", keyboard);
      break;
    }
    case "match_pairs":
      for (const pair of exercise.pairs) {
        await activate(page, pair.learning, keyboard);
        await activate(page, pair.known, keyboard);
      }
      break;
    case "listen":
    case "word_bank_translate": {
      const tiles = tilesFor(exercise.answers[0]!, exercise.tiles);
      if (!tiles) throw new Error(`${exercise.id}: answer can't be built from its tiles`);
      const bank = page.getByRole("group", { name: "Word bank" });
      for (const tile of tiles) await activate(page, `Add ${tile}`, keyboard, bank);
      await activate(page, "Check", keyboard);
      break;
    }
    case "speak":
      // Not needed by the specs (the lessons they play have no speak exercise).
      throw new Error(`${exercise.id}: speak exercises aren't supported by this helper`);
  }
  await activate(page, "Continue", keyboard);
}

/** Answers a multiple-choice exercise wrong (first wrong option) and continues. */
export async function answerWrong(
  page: Page,
  exercise: ExerciseJson,
  { keyboard = false }: PlayOptions = {},
): Promise<void> {
  if (exercise.type !== "multiple_choice") throw new Error(`${exercise.id}: not multiple choice`);
  await expect(
    page.getByRole("heading", { level: 2, name: exercise.prompt, exact: true }),
  ).toBeVisible();
  const wrong = exercise.options.find((o) => o.id !== exercise.correctOptionId)!;
  await choose(page, wrong.text, keyboard);
  await activate(page, "Check", keyboard);
  await activate(page, "Continue", keyboard);
}

/** Plays a lesson from the course data, all answers correct, to the results screen. */
export async function playLesson(
  page: Page,
  lesson: LessonJson,
  options: PlayOptions = {},
): Promise<void> {
  await expect(page).toHaveURL(lessonUrl(lesson.id));
  for (const exercise of lesson.exercises) await answerCorrectly(page, exercise, options);
  await expect(page.getByRole("heading", { level: 1, name: "Lesson complete!" })).toBeVisible();
}

/** The first German lesson's file. */
export const germanLesson1 = (): LessonJson => readLesson("en-de", GERMAN_LESSON_1.id);
