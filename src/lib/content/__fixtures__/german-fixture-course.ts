/**
 * Test-only German course (CTO-008 criterion 12): `en-de` with level A1 (2 units × 2
 * lessons) and A2 declared without units ("Coming soon"). For feature tests (GAM-010
 * path level headers, PLT-024 onboarding/Learn, LES-014 player). Never imported by app
 * code; ids follow the en-de convention (ADR-008).
 */
import { CourseSchema, LessonSchema, type Course, type Lesson } from "@/contracts";
import type { ContentLoaders } from "../bundled-content";
import { createContentRepository } from "../content-repository";

export const GERMAN_FIXTURE_COURSE_ID = "en-de";

export const GERMAN_FIXTURE_COURSE: Course = CourseSchema.parse({
  id: GERMAN_FIXTURE_COURSE_ID,
  title: "German",
  learningLanguage: "de",
  knownLanguage: "en",
  version: 1,
  levels: [
    { level: "A1", title: "A1 · Beginner", description: "Everyday phrases and basic needs." },
    { level: "A2", title: "A2 · Elementary" },
  ],
  units: [
    {
      id: "de-a1-u01",
      level: "A1",
      title: "Hello!",
      lessons: [
        { id: "de-a1-u01-l1-hallo", title: "Hallo!" },
        { id: "de-a1-u01-l2-wie-geht-s", title: "How Are You?" },
      ],
    },
    {
      id: "de-a1-u02",
      level: "A1",
      title: "At the Bakery",
      lessons: [
        { id: "de-a1-u02-l1-brot", title: "Bread" },
        { id: "de-a1-u02-l2-bitte", title: "Please" },
      ],
    },
  ],
});

function germanLesson(id: string, unitId: string, title: string): Lesson {
  // `de-a1-u01-l1-hallo` → exercise ids `de-a1-u01-l1-ex01`, `…-ex02`.
  const prefix = id.split("-").slice(0, 4).join("-");
  return LessonSchema.parse({
    id,
    courseId: GERMAN_FIXTURE_COURSE_ID,
    unitId,
    title,
    exercises: [
      {
        id: `${prefix}-ex01`,
        type: "multiple_choice",
        prompt: "Which one means 'beautiful'?",
        options: [
          { id: "a", text: "schön" },
          { id: "b", text: "schon" },
          { id: "c", text: "Straße" },
        ],
        correctOptionId: "a",
      },
      {
        id: `${prefix}-ex02`,
        type: "word_bank_translate",
        direction: "to_learning",
        prompt: "The dog is beautiful.",
        tiles: ["Der", "Hund", "ist", "schön", "schon", "Katze"],
        answers: ["Der Hund ist schön."],
      },
    ],
  });
}

export const GERMAN_FIXTURE_LESSONS: Record<string, Lesson> = Object.fromEntries(
  GERMAN_FIXTURE_COURSE.units.flatMap((unit) =>
    unit.lessons.map((l) => [l.id, germanLesson(l.id, unit.id, l.title)] as const),
  ),
);

export function germanFixtureLoaders(): ContentLoaders {
  return {
    courses: { [GERMAN_FIXTURE_COURSE_ID]: async () => GERMAN_FIXTURE_COURSE },
    lessons: {
      [GERMAN_FIXTURE_COURSE_ID]: Object.fromEntries(
        Object.entries(GERMAN_FIXTURE_LESSONS).map(([id, raw]) => [id, async () => raw]),
      ),
    },
  };
}

export function createGermanFixtureRepository() {
  return createContentRepository(germanFixtureLoaders());
}
