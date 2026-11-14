/**
 * Course fixtures with CEFR levels for GAM-010 tests. Generated, then parsed with
 * `CourseSchema`, so they obey every CTO-008 level rule (ADR-008).
 */
import { CEFR_LEVELS, CourseSchema, type CefrLevel, type Course } from "@/contracts";

const LEVEL_TITLES: Record<CefrLevel, string> = {
  A1: "A1 · Beginner",
  A2: "A2 · Elementary",
  B1: "B1 · Intermediate",
  B2: "B2 · Upper Intermediate",
  C1: "C1 · Advanced",
  C2: "C2 · Proficient",
};

/** Lesson id `<level>-u<unit>-l<lesson>`, e.g. `b1-u03-l2` (lower-case slug). */
export function lessonIdOf(level: CefrLevel, unit: number, lesson: number): string {
  return `${level.toLowerCase()}-u${String(unit).padStart(2, "0")}-l${lesson}`;
}

/**
 * A course with the given number of units per level (0 = "Coming soon") and
 * `lessonsPerUnit` lessons each. `{ A1: 2, A2: 2, B1: 0 }` → A1 and A2 with 2 units, B1
 * declared without units. Lesson titles are "<LEVEL> U<n> L<m>".
 */
export function makeLevelCourse(
  unitsPerLevel: Partial<Record<CefrLevel, number>>,
  lessonsPerUnit = 2,
): Course {
  const levels = CEFR_LEVELS.filter((level) => unitsPerLevel[level] !== undefined);
  return CourseSchema.parse({
    id: "en-de",
    title: "German",
    learningLanguage: "de",
    knownLanguage: "en",
    version: 1,
    levels: levels.map((level) => ({ level, title: LEVEL_TITLES[level] })),
    units: levels.flatMap((level) =>
      Array.from({ length: unitsPerLevel[level]! }, (_, u) => ({
        id: `${level.toLowerCase()}-u${String(u + 1).padStart(2, "0")}`,
        level,
        title: `${level} Unit ${u + 1}`,
        description: `What you learn in ${level} unit ${u + 1}.`,
        lessons: Array.from({ length: lessonsPerUnit }, (_, l) => ({
          id: lessonIdOf(level, u + 1, l + 1),
          title: `${level} U${u + 1} L${l + 1}`,
        })),
      })),
    ),
  });
}

/** Every lesson id of `course` in path order. */
export function allLessonIds(course: Course): string[] {
  return course.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id));
}

/** Every lesson id of the units of `level`. */
export function lessonIdsOfLevel(course: Course, level: CefrLevel): string[] {
  return course.units
    .filter((unit) => unit.level === level)
    .flatMap((unit) => unit.lessons.map((lesson) => lesson.id));
}
