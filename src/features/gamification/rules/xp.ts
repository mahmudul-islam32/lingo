/**
 * XP rules (PD-003, PD-008, PD-012). Pure: no clock, no storage, no XP literals.
 * Every number comes from the config argument (default `GAME_CONFIG`).
 */
import {
  GAME_CONFIG,
  type ComputeLessonXp,
  type DeriveXpEvents,
  type LessonResult,
  type LessonSessionStatus,
  type XpBreakdown,
  type XpEvent,
} from "@/contracts";
import type { XpConfig } from "./config";

/** What `calculateXp` needs to know about a finished (or abandoned) lesson. */
export interface LessonXpSummary {
  /** Only `"completed"` earns XP; `quit` and `out_of_hearts` earn 0. */
  status: LessonSessionStatus;
  /** Wrong "Check" results + 1 per match-pairs exercise with a mismatch (PD-012). */
  mistakeCount: number;
  /** Exercises counted for scoring: hidden, unsupported and skipped ones excluded (PD-012). */
  countedExerciseCount: number;
}

/** Contract breakdown plus its sum (`LessonResult.xpEarned`). */
export type LessonXp = XpBreakdown & { total: number };

/** PD-012: perfect = 0 mistakes and at least 1 counted exercise. */
export function isPerfectLesson(
  summary: Pick<LessonXpSummary, "mistakeCount" | "countedExerciseCount">,
): boolean {
  return summary.mistakeCount === 0 && summary.countedExerciseCount > 0;
}

/**
 * Contract rule `ComputeLessonXp`: XP for a **completed** lesson. Base XP for every
 * completion (replays included, PD-008) plus the perfect bonus when `perfect`.
 */
export function computeLessonXp(
  input: { perfect: boolean },
  config: XpConfig = GAME_CONFIG,
): XpBreakdown {
  return {
    base: config.xpPerLesson,
    perfectBonus: input.perfect ? config.perfectLessonBonusXp : 0,
  };
}
computeLessonXp satisfies ComputeLessonXp;

/** Sum of a breakdown; equals `LessonResult.xpEarned`. */
export function totalXp(breakdown: XpBreakdown): number {
  return breakdown.base + breakdown.perfectBonus;
}

/**
 * GAM-002 `calculateXp(summary, config)`: XP for any lesson outcome. A lesson that was
 * not completed earns 0 in every field. Replays earn the same as first plays (the
 * summary carries no "first time" flag on purpose, PD-008).
 */
export function calculateXp(summary: LessonXpSummary, config: XpConfig = GAME_CONFIG): LessonXp {
  if (summary.status !== "completed") {
    return { base: 0, perfectBonus: 0, total: 0 };
  }
  const breakdown = computeLessonXp({ perfect: isPerfectLesson(summary) }, config);
  return { ...breakdown, total: totalXp(breakdown) };
}

/**
 * Contract rule `DeriveXpEvents`: one `XpEvent` per non-zero breakdown line, in the
 * order base then bonus. `newId` supplies the event ids (e.g. `crypto.randomUUID`).
 */
export const deriveXpEvents: DeriveXpEvents = (result: LessonResult, newId: () => string) => {
  const lines: ReadonlyArray<readonly [XpEvent["reason"], number]> = [
    ["lesson_completed", result.xp.base],
    ["perfect_lesson_bonus", result.xp.perfectBonus],
  ];
  return lines
    .filter(([, amount]) => amount > 0)
    .map(([reason, amount]) => ({
      id: newId(),
      lessonResultId: result.id,
      reason,
      amount,
      occurredAt: result.completedAt,
      localDate: result.localDate,
    }));
};
