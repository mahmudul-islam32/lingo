/**
 * Finished session → `LessonResult` (PLT-008). Same mapping LES-008's `toLessonResult`
 * will provide: XP from `calculateXp`, local date from `toLocalDate`, both from the
 * gamification public API. Pure apart from the default timezone.
 */
import type { LessonResult, Uuid } from "@/contracts";
import { calculateXp, toLocalDate } from "@/features/gamification";
import { buildLessonResult, type LessonSessionSummary } from "@/features/lessons";

/** Device IANA timezone, `UTC` if it can't be resolved. */
export function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function resultFromSummary(
  summary: LessonSessionSummary,
  { id, timeZone = deviceTimeZone() }: { id: Uuid; timeZone?: string },
): LessonResult {
  const { base, perfectBonus } = calculateXp({
    status: summary.session.status,
    mistakeCount: summary.mistakeCount,
    countedExerciseCount: summary.exerciseCount - summary.skippedCount,
  });
  return buildLessonResult(summary, {
    id,
    xp: { base, perfectBonus },
    timeZone,
    localDate: toLocalDate(new Date(summary.completedAt), timeZone),
  });
}
