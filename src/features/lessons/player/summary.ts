/**
 * End-of-lesson summary (LES-002 criterion 11) and its mapping to the contracts
 * `LessonResult` (used by LES-008). Pure.
 */
import {
  LessonResultSchema,
  type IsoDateTime,
  type LessonResult,
  type LessonSession,
  type LocalDate,
  type Uuid,
  type XpBreakdown,
} from "@/contracts";
import { sessionStats } from "./session-reducer";

export interface LessonSessionSummary {
  /** Status "completed", full attempts list (per-exercise attempts). */
  session: LessonSession;
  /** First exercise shown (criterion 12). */
  startedAt: IsoDateTime;
  /** Last "Continue". */
  completedAt: IsoDateTime;
  /**
   * Distinct exercises presented, hidden/unsupported ones excluded. Skipped ones are
   * included, as in `LessonResult.exerciseCount`; the counted total used for progress
   * and accuracy is `exerciseCount − skippedCount`.
   */
  exerciseCount: number;
  firstTryCorrectCount: number;
  mistakeCount: number;
  skippedCount: number;
  /**
   * PD-012 perfect lesson: 0 mistakes and at least 1 counted exercise. Pass it to
   * `computeLessonXp({ perfect })`.
   */
  perfect: boolean;
}

/** Builds the summary of a finished session. */
export function summarizeSession(
  session: LessonSession,
  completedAt: IsoDateTime,
): LessonSessionSummary {
  const stats = sessionStats(session);
  return {
    session,
    startedAt: session.startedAt,
    completedAt,
    exerciseCount: stats.exerciseCount,
    firstTryCorrectCount: stats.firstTryCorrectCount,
    mistakeCount: stats.mistakeCount,
    skippedCount: stats.skippedCount,
    perfect: stats.perfect,
  };
}

/** `firstTryCorrectCount / (exerciseCount − skippedCount)`, 1 when the denominator is 0. */
export function lessonAccuracy(
  summary: Pick<LessonSessionSummary, "exerciseCount" | "skippedCount" | "firstTryCorrectCount">,
): number {
  const counted = summary.exerciseCount - summary.skippedCount;
  if (counted <= 0) return 1;
  return Math.min(1, Math.max(0, summary.firstTryCorrectCount / counted));
}

export interface BuildLessonResultInput {
  /** Client UUID, the idempotency key for sync. */
  id: Uuid;
  /** From `computeLessonXp({ perfect: summary.perfect })` (gamification). */
  xp: XpBreakdown;
  /** Device timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`). */
  timeZone: string;
  /** `toLocalDate(completedAt, timeZone)`. */
  localDate: LocalDate;
}

/**
 * Pure mapping used by LES-008: summary + XP → contracts `LessonResult`. The result is
 * parsed with `LessonResultSchema`, so an inconsistent input throws instead of being
 * saved.
 *
 * `perfect` follows the contract refinement (`mistakeCount === 0`). In the edge case
 * where every exercise was skipped, PD-012 says "not perfect" (see `summary.perfect`,
 * which decides the bonus XP) while the schema requires `perfect: true`; raised in CR-002.
 */
export function buildLessonResult(
  summary: LessonSessionSummary,
  input: BuildLessonResultInput,
): LessonResult {
  const { session } = summary;
  const durationMs = Math.max(0, Date.parse(summary.completedAt) - Date.parse(summary.startedAt));
  return LessonResultSchema.parse({
    id: input.id,
    courseId: session.courseId,
    unitId: session.unitId,
    lessonId: session.lessonId,
    startedAt: summary.startedAt,
    completedAt: summary.completedAt,
    durationMs,
    exerciseCount: summary.exerciseCount,
    firstTryCorrectCount: summary.firstTryCorrectCount,
    mistakeCount: summary.mistakeCount,
    skippedCount: summary.skippedCount,
    accuracy: lessonAccuracy(summary),
    perfect: summary.mistakeCount === 0,
    xp: input.xp,
    xpEarned: input.xp.base + input.xp.perfectBonus,
    heartsLost: Math.max(0, session.heartsAtStart - session.heartsRemaining),
    localDate: input.localDate,
    timeZone: input.timeZone,
  });
}
