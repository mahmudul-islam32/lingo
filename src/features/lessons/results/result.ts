/**
 * Finished session → contracts `LessonResult` (LES-008 criterion 2). XP comes only from
 * `calculateXp` and the local date only from `toLocalDate`, both through the public
 * `@/features/gamification` API: the lessons feature holds no XP numbers.
 */
import type { LessonResult, Uuid } from "@/contracts";
import { calculateXp, toLocalDate, type LessonXp } from "@/features/gamification";
import { buildLessonResult, type LessonSessionSummary } from "../player";

/** `calculateXp` for a finished session (counted = presented − skipped, PD-012). */
export function lessonXpFor(summary: LessonSessionSummary): LessonXp {
  return calculateXp({
    status: summary.session.status,
    mistakeCount: summary.mistakeCount,
    countedExerciseCount: summary.exerciseCount - summary.skippedCount,
  });
}

/** Device timezone, falling back to UTC when `Intl` cannot resolve one. */
export function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export interface ToLessonResultInput {
  /**
   * Idempotency key. Create it **once** per finished session (`crypto.randomUUID()`) and
   * keep it with the session, so re-renders and "Try again" reuse it.
   */
  id: Uuid;
  /** Defaults to the device timezone. */
  timeZone?: string;
}

/** Pure apart from the `timeZone` default; throws if the summary is inconsistent. */
export function toLessonResult(
  summary: LessonSessionSummary,
  { id, timeZone = deviceTimeZone() }: ToLessonResultInput,
): LessonResult {
  const { base, perfectBonus } = lessonXpFor(summary);
  return buildLessonResult(summary, {
    id,
    xp: { base, perfectBonus },
    timeZone,
    localDate: toLocalDate(new Date(summary.completedAt), timeZone),
  });
}
