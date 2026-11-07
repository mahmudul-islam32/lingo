/**
 * Test-only content (PLT-007 criterion 14): a small course valid against the contract
 * schemas. Never imported by app code.
 */
import { CourseSchema, LessonSchema, type Course, type Lesson } from "@/contracts";
import type { ContentLoaders } from "../bundled-content";
import { createContentRepository } from "../content-repository";

export const FIXTURE_COURSE_ID = "fx-es";

export const FIXTURE_COURSE: Course = CourseSchema.parse({
  id: FIXTURE_COURSE_ID,
  title: "Fixture Spanish",
  learningLanguage: "es",
  knownLanguage: "en",
  version: 1,
  units: [
    {
      id: "fx-unit-1",
      title: "Fixture Unit",
      lessons: [
        { id: "fx-l1", title: "Greetings" },
        { id: "fx-l2", title: "Numbers" },
      ],
    },
  ],
});

function fixtureLesson(id: string, title: string): Lesson {
  return LessonSchema.parse({
    id,
    courseId: FIXTURE_COURSE_ID,
    unitId: "fx-unit-1",
    title,
    exercises: [
      {
        id: `${id}-ex1`,
        type: "multiple_choice",
        prompt: "Which one means 'hello'?",
        options: [
          { id: "a", text: "Hola" },
          { id: "b", text: "Adiós" },
          { id: "c", text: "Gracias" },
        ],
        correctOptionId: "a",
      },
      {
        id: `${id}-ex2`,
        type: "multiple_choice",
        prompt: "Which one means 'thank you'?",
        options: [
          { id: "a", text: "Hola" },
          { id: "b", text: "Adiós" },
          { id: "c", text: "Gracias" },
        ],
        correctOptionId: "c",
      },
    ],
  });
}

export const FIXTURE_LESSONS: Record<string, Lesson> = {
  "fx-l1": fixtureLesson("fx-l1", "Greetings"),
  "fx-l2": fixtureLesson("fx-l2", "Numbers"),
};

/** Loaders over the fixture; `overrides` replace raw files (e.g. invalid JSON). */
export function fixtureLoaders(
  overrides: { course?: unknown; lessons?: Record<string, unknown> } = {},
): ContentLoaders {
  const lessons = { ...FIXTURE_LESSONS, ...overrides.lessons };
  return {
    courses: { [FIXTURE_COURSE_ID]: async () => overrides.course ?? FIXTURE_COURSE },
    lessons: {
      [FIXTURE_COURSE_ID]: Object.fromEntries(
        Object.entries(lessons).map(([id, raw]) => [id, async () => raw]),
      ),
    },
  };
}

export function createFixtureRepository(overrides?: Parameters<typeof fixtureLoaders>[0]) {
  return createContentRepository(fixtureLoaders(overrides));
}
