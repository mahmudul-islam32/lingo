/**
 * Practice tab list (GAM-012 AC6, AC8; PD-065, PD-066 §5). Pure: the learner's finished
 * lessons of one course, grouped by unit, most recent first. A lesson that isn't in
 * `completedLessonIds` never appears.
 */
import type { CefrLevel, Course, LessonResult, LessonSummary, Slug, Unit } from "@/contracts";

export interface PracticeLesson {
  lesson: LessonSummary;
  /** 1-based position in its unit ("Lesson 2"). */
  lessonNumber: number;
  /** Latest `completedAt` of the lesson (ISO), `null` if no result carries one. */
  lastPlayedAt: string | null;
}

export interface PracticeUnitGroup {
  unit: Unit;
  /** CEFR level of the unit, `null` for courses without levels. */
  level: CefrLevel | null;
  /** 1-based number of the unit within its level (or the course, without levels). */
  unitNumber: number;
  /** Finished lessons, most recently played first. */
  lessons: PracticeLesson[];
}

/**
 * Finished lessons grouped by unit. Units are ordered by their most recently played
 * lesson (newest first), lessons within a unit likewise; ties (same instant, or no
 * result) fall back to the later position in the course first, so a learner who plays
 * in order sees the newest lesson on top. `results` only supplies the order; other
 * courses' results are ignored.
 */
export function buildPracticeList(
  course: Course,
  completedLessonIds: readonly Slug[],
  results: readonly Pick<LessonResult, "courseId" | "lessonId" | "completedAt">[] = [],
): PracticeUnitGroup[] {
  const completed = new Set(completedLessonIds);
  if (completed.size === 0) return [];

  const lastPlayed = new Map<Slug, string>();
  for (const result of results) {
    if (result.courseId !== course.id) continue;
    const previous = lastPlayed.get(result.lessonId);
    if (previous === undefined || Date.parse(result.completedAt) > Date.parse(previous)) {
      lastPlayed.set(result.lessonId, result.completedAt);
    }
  }

  const unitsPerLevel = new Map<CefrLevel | null, number>();
  const groups: (PracticeUnitGroup & { order: number; latest: number })[] = [];
  let order = 0;
  for (const unit of course.units) {
    const level = unit.level ?? null;
    const unitNumber = (unitsPerLevel.get(level) ?? 0) + 1;
    unitsPerLevel.set(level, unitNumber);
    const lessons: (PracticeLesson & { order: number; time: number })[] = [];
    unit.lessons.forEach((lesson, index) => {
      order += 1;
      if (!completed.has(lesson.id)) return;
      const lastPlayedAt = lastPlayed.get(lesson.id) ?? null;
      const time = lastPlayedAt === null ? Number.NEGATIVE_INFINITY : Date.parse(lastPlayedAt);
      lessons.push({ lesson, lessonNumber: index + 1, lastPlayedAt, order, time });
    });
    if (lessons.length === 0) continue;
    lessons.sort(newestFirst);
    groups.push({
      unit,
      level,
      unitNumber,
      lessons: lessons.map(({ lesson, lessonNumber, lastPlayedAt }) => ({
        lesson,
        lessonNumber,
        lastPlayedAt,
      })),
      order: lessons[0]!.order,
      latest: lessons[0]!.time,
    });
  }
  groups.sort((a, b) =>
    newestFirst({ time: a.latest, order: a.order }, { time: b.latest, order: b.order }),
  );
  return groups.map(({ unit, level, unitNumber, lessons }) => ({
    unit,
    level,
    unitNumber,
    lessons,
  }));
}

function newestFirst(
  a: { time: number; order: number },
  b: { time: number; order: number },
): number {
  if (a.time !== b.time) return b.time > a.time ? 1 : -1;
  return b.order - a.order;
}
