/**
 * Smart review selection (GAM-015 AC1–AC6, CTO-019 criterion 9, ADR-019 §5, PD-079,
 * PD-081). Pure: `today` is passed in, nothing is stored. The schedule is derived on every
 * call from `LessonResult.exerciseOutcomes`.
 */
import {
  GAME_CONFIG,
  isReviewExerciseType,
  type LessonResult,
  type LocalDate,
  type ReviewSelection,
  type SelectReviewItems,
  type Slug,
} from "@/contracts";
import { addDays, localDateToDayNumber } from "./local-date";

/** One eligible exercise with its derived schedule (exported for tests and the hook). */
export interface ReviewScheduleEntry {
  lessonId: Slug;
  exerciseId: Slug;
  /** `localDate` of the result holding the latest counted outcome. */
  lastSeen: LocalDate;
  /** `correct` outcomes in a row at the end of the history. */
  correctRun: number;
  dueDate: LocalDate;
  due: boolean;
  /** Index of the lesson in course order. */
  lessonOrder: number;
  /** Index of the exercise in its latest result's `exerciseOutcomes`. */
  position: number;
}

/** `interval` in days for a run of correct answers (AC2). */
export function reviewIntervalDays(
  correctRun: number,
  intervals: readonly number[] = GAME_CONFIG.reviewIntervalsDays,
): number {
  if (correctRun <= 0) return 0;
  return intervals[Math.min(correctRun, intervals.length) - 1]!;
}

/** Results by `completedAt` ascending; equal instants keep their input order. */
function chronological(results: readonly LessonResult[]): LessonResult[] {
  return results
    .map((result, index) => ({ result, index, time: Date.parse(result.completedAt) }))
    .sort((a, b) => a.time - b.time || a.index - b.index)
    .map(({ result }) => result);
}

/**
 * The schedule of every eligible exercise, unordered (AC1, AC2). Only results of
 * `course` count; outcomes of lessons no longer in the manifest, of non-review types or
 * `skipped` are ignored.
 */
export function reviewSchedule(input: Parameters<SelectReviewItems>[0]): ReviewScheduleEntry[] {
  const { course, results, today } = input;
  const lessonOrder = new Map<Slug, number>();
  for (const unit of course.units) {
    for (const lesson of unit.lessons) lessonOrder.set(lesson.id, lessonOrder.size);
  }

  const entries = new Map<string, Omit<ReviewScheduleEntry, "dueDate" | "due">>();
  for (const result of chronological(results.filter((r) => r.courseId === course.id))) {
    (result.exerciseOutcomes ?? []).forEach((outcome, position) => {
      const order = lessonOrder.get(outcome.lessonId);
      if (order === undefined) return;
      if (outcome.outcome === "skipped" || !isReviewExerciseType(outcome.exerciseType)) return;
      const key = `${outcome.lessonId}\u0000${outcome.exerciseId}`;
      const previousRun = entries.get(key)?.correctRun ?? 0;
      entries.set(key, {
        lessonId: outcome.lessonId,
        exerciseId: outcome.exerciseId,
        lastSeen: result.localDate,
        correctRun: outcome.outcome === "correct" ? previousRun + 1 : 0,
        lessonOrder: order,
        position,
      });
    });
  }

  const todayNumber = localDateToDayNumber(today);
  return [...entries.values()].map((entry) => {
    const dueDate = addDays(entry.lastSeen, reviewIntervalDays(entry.correctRun));
    return { ...entry, dueDate, due: localDateToDayNumber(dueDate) <= todayNumber };
  });
}

/** AC3 order: due first; then `correctRun`, `dueDate`, lesson order, position, id. */
function compareEntries(a: ReviewScheduleEntry, b: ReviewScheduleEntry): number {
  if (a.due !== b.due) return a.due ? -1 : 1;
  if (a.correctRun !== b.correctRun) return a.correctRun - b.correctRun;
  const dueDiff = localDateToDayNumber(a.dueDate) - localDateToDayNumber(b.dueDate);
  if (dueDiff !== 0) return dueDiff;
  if (a.lessonOrder !== b.lessonOrder) return a.lessonOrder - b.lessonOrder;
  if (a.position !== b.position) return a.position - b.position;
  // Equal ids here would be the same (lessonId, exerciseId) key, which `reviewSchedule` merges.
  return a.exerciseId < b.exerciseId ? -1 : 1;
}

/**
 * Contract rule `SelectReviewItems` (the full rule is documented on the type in
 * `src/contracts/api.ts`). `candidates` is the full ranked list, one per `exerciseId`;
 * `dueCount` and `eligibleCount` count eligible `(lessonId, exerciseId)` pairs.
 */
export const selectReviewItems: SelectReviewItems = (input): ReviewSelection => {
  const ranked = reviewSchedule(input).sort(compareEntries);
  const seen = new Set<Slug>();
  const candidates: ReviewSelection["candidates"] = [];
  let dueCount = 0;
  for (const entry of ranked) {
    if (entry.due) dueCount += 1;
    if (seen.has(entry.exerciseId)) continue;
    seen.add(entry.exerciseId);
    candidates.push({ lessonId: entry.lessonId, exerciseId: entry.exerciseId });
  }
  return { candidates, dueCount, eligibleCount: ranked.length };
};
