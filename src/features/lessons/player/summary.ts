/**
 * End-of-lesson summary (LES-002 criterion 11) and its mapping to the contracts
 * `LessonResult` (used by LES-008). Pure.
 */
import {
  LessonResultSchema,
  REVIEW_SESSION_ID,
  type ExerciseAttempt,
  type ExerciseOutcome,
  type ExerciseOutcomeKind,
  type IsoDateTime,
  type LessonResult,
  type LessonSession,
  type LocalDate,
  type Slug,
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
  /**
   * Hearts actually lost in the session (LES-020: earned hearts make
   * `heartsAtStart − heartsRemaining` wrong). Missing → that difference.
   */
  heartsLost?: number;
  /** Hearts earned by correct answers in the session (LES-020). */
  heartsGained?: number;
  /**
   * Set for a review session (LES-023, ADR-019 §3, §5): the result becomes a `review`
   * result and each outcome takes its exercise's source lesson from here.
   */
  review?: ReviewSource;
}

/**
 * Where the exercises of a review session come from (LES-023). Built by
 * `buildReviewLesson` from the `ReviewItem`s; keyed by exercise id (a review session
 * holds each exercise id once, ADR-019 §5).
 */
export interface ReviewSource {
  sourceLessonIds: Readonly<Record<Slug, Slug>>;
}

export interface SessionHeartsTotals {
  heartsLost: number;
  heartsGained: number;
}

/** Builds the summary of a finished session. */
export function summarizeSession(
  session: LessonSession,
  completedAt: IsoDateTime,
  hearts?: SessionHeartsTotals,
  review?: ReviewSource,
): LessonSessionSummary {
  const stats = sessionStats(session);
  return {
    ...(hearts ? { heartsLost: hearts.heartsLost, heartsGained: hearts.heartsGained } : {}),
    ...(review ? { review } : {}),
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

function outcomeOf(attempts: readonly ExerciseAttempt[]): ExerciseOutcomeKind {
  if (attempts.some((a) => a.outcome === "skipped")) return "skipped";
  const first = attempts[0];
  if (first && first.outcome === "correct" && !first.mistake) return "correct";
  return "incorrect";
}

/**
 * Per-exercise outcomes of a finished session (LES-023 AC 1, CTO-019 criterion 1,
 * ADR-019 §1). One per presented (not hidden) exercise, in order of first presentation,
 * first match wins: `skipped` (any skipped attempt), `correct` (first attempt correct
 * with no mistake), else `incorrect`. The same rules as `sessionStats`, so the `correct`
 * count equals `firstTryCorrectCount` and the `skipped` count equals `skippedCount`.
 *
 * `lessonIdOf` maps an exercise id to the lesson stored on its outcome: the session's
 * lesson by default, the source lesson in a review.
 */
export function exerciseOutcomesOf(
  session: LessonSession,
  lessonIdOf: (exerciseId: Slug) => Slug = () => session.lessonId,
): ExerciseOutcome[] {
  const hidden = new Set(session.hiddenExerciseIds);
  const byExercise = new Map<Slug, ExerciseAttempt[]>();
  for (const attempt of session.attempts) {
    if (hidden.has(attempt.exerciseId)) continue;
    const list = byExercise.get(attempt.exerciseId);
    if (list) list.push(attempt);
    else byExercise.set(attempt.exerciseId, [attempt]);
  }
  const outcomes: ExerciseOutcome[] = [];
  for (const [exerciseId, attempts] of byExercise) {
    const first = attempts[0];
    if (!first) continue;
    outcomes.push({
      lessonId: lessonIdOf(exerciseId),
      exerciseId,
      exerciseType: first.exerciseType,
      outcome: outcomeOf(attempts),
    });
  }
  return outcomes;
}

/** Outcomes for a summary: source lessons for a review (throws if one is unknown). */
function summaryOutcomes(summary: LessonSessionSummary): ExerciseOutcome[] {
  const { review, session } = summary;
  if (!review) return exerciseOutcomesOf(session);
  return exerciseOutcomesOf(session, (exerciseId) => {
    const lessonId = review.sourceLessonIds[exerciseId];
    if (lessonId === undefined) {
      throw new Error(`[lessons] review exercise "${exerciseId}" has no source lesson`);
    }
    return lessonId;
  });
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
 * `perfect` is `summary.perfect` (PD-012: no mistakes and at least 1 counted exercise),
 * the same rule as the `LessonResultSchema` refinement (CR-003).
 */
export function buildLessonResult(
  summary: LessonSessionSummary,
  input: BuildLessonResultInput,
): LessonResult {
  const { session } = summary;
  const isReview = summary.review !== undefined;
  const durationMs = Math.max(0, Date.parse(summary.completedAt) - Date.parse(summary.startedAt));
  return LessonResultSchema.parse({
    id: input.id,
    courseId: session.courseId,
    // ADR-019 §3: a review result uses the reserved ids, whatever the session says.
    unitId: isReview ? REVIEW_SESSION_ID : session.unitId,
    lessonId: isReview ? REVIEW_SESSION_ID : session.lessonId,
    ...(isReview ? { kind: "review" } : {}),
    startedAt: summary.startedAt,
    completedAt: summary.completedAt,
    durationMs,
    exerciseCount: summary.exerciseCount,
    firstTryCorrectCount: summary.firstTryCorrectCount,
    mistakeCount: summary.mistakeCount,
    skippedCount: summary.skippedCount,
    accuracy: lessonAccuracy(summary),
    perfect: summary.perfect,
    xp: input.xp,
    xpEarned: input.xp.base + input.xp.perfectBonus,
    heartsLost: summary.heartsLost ?? Math.max(0, session.heartsAtStart - session.heartsRemaining),
    localDate: input.localDate,
    timeZone: input.timeZone,
    // LES-023 AC 1: every finished session carries its outcomes (ADR-019 §2).
    exerciseOutcomes: summaryOutcomes(summary),
  });
}
