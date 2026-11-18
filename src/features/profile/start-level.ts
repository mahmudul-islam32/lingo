/**
 * Start level (PLT-025, ADR-013, PD-064): which CEFR levels a learner can start at and
 * where that start is in the course. Pure; shared by onboarding, Profile and the route.
 */
import {
  cefrLevelIndex,
  type CefrLevel,
  type Course,
  type CourseLevel,
  type LessonSummary,
} from "@/contracts";

/** One-line description per level, used when the course doesn't declare one. */
export const START_LEVEL_DESCRIPTIONS: Record<CefrLevel, string> = {
  A1: "Start from the very beginning",
  A2: "You know greetings, numbers and everyday words",
  B1: "You can get by in everyday conversations",
  B2: "You can talk about most topics with ease",
  C1: "You understand complex texts and speak fluently",
  C2: "You understand almost everything you hear or read",
};

export interface StartLevelOption {
  level: CefrLevel;
  /** E.g. "A1 · Beginner" (the course's level title). */
  label: string;
  description: string;
}

function optionOf(level: CourseLevel): StartLevelOption {
  return {
    level: level.level,
    label: level.title,
    description: level.description ?? START_LEVEL_DESCRIPTIONS[level.level],
  };
}

/**
 * The levels a learner can start at: the course's declared levels that have at least one
 * unit, in course order (PLT-025 AC 1). `[]` for a course without levels.
 */
export function startLevelOptions(course: Course): StartLevelOption[] {
  return (course.levels ?? [])
    .filter((level) => course.units.some((unit) => unit.level === level.level))
    .map(optionOf);
}

/** True when the course offers a real choice (2+ levels with content, PLT-025 AC 3). */
export function hasStartLevelChoice(course: Course): boolean {
  return startLevelOptions(course).length > 1;
}

/**
 * The level the learner effectively starts at: `startLevel` if the course has content
 * for it, else the first level with content (ADR-013 §1.5). `null` without levels.
 */
export function effectiveStartLevel(
  course: Course,
  startLevel: CefrLevel | null | undefined,
): CefrLevel | null {
  const options = startLevelOptions(course);
  return options.find((o) => o.level === startLevel)?.level ?? options[0]?.level ?? null;
}

/** "A2 · Elementary" for the learner's effective level (first level when not set). */
export function startLevelLabel(
  course: Course,
  startLevel: CefrLevel | null | undefined,
): string | null {
  const level = effectiveStartLevel(course, startLevel);
  return startLevelOptions(course).find((o) => o.level === level)?.label ?? null;
}

/** First lesson of `level` in course order; the course's first lesson as a fallback. */
export function firstLessonOfLevel(course: Course, level: CefrLevel | null): LessonSummary {
  const unit = course.units.find((u) => level !== null && u.level === level) ?? course.units[0]!;
  return unit.lessons[0]!;
}

/** True when `next` is an earlier CEFR level than `current` (PLT-025 AC 9 warning). */
export function isLowerLevel(next: CefrLevel, current: CefrLevel): boolean {
  return cefrLevelIndex(next) < cefrLevelIndex(current);
}
