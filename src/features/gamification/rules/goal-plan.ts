/**
 * Goal date rule (GAM-013, CTO-017, ADR-015, PD-071 §1.3). Pure: no clock, no storage; it
 * creates and changes no result, XP, streak, hearts or setting. The rule text lives in the
 * `ComputeGoalPlan` doc comment in `src/contracts/api.ts`.
 */
import {
  GAME_CONFIG,
  type CefrLevel,
  type ComputeGoalPlan,
  type Course,
  type DailyGoalXp,
  type GoalPlanState,
  type GoalPlanStatus,
} from "@/contracts";
import { localDateToDayNumber } from "./local-date";

/** Levels of `course` with at least one lesson, in course order (`Unit.level`, ADR-008). */
export function levelsWithContent(course: Course): CefrLevel[] {
  const levels: CefrLevel[] = [];
  for (const unit of course.units) {
    if (unit.level && unit.lessons.length > 0 && !levels.includes(unit.level)) {
      levels.push(unit.level);
    }
  }
  return levels;
}

/** Smallest daily-goal option ≥ `requiredXp`, else the largest option. */
export function suggestDailyGoalXp(
  requiredXp: number,
  options: readonly DailyGoalXp[] = GAME_CONFIG.dailyGoalOptions,
): DailyGoalXp {
  const sorted = [...options].sort((a, b) => a - b);
  return sorted.find((option) => option >= requiredXp) ?? sorted[sorted.length - 1]!;
}

/** Contract rule `ComputeGoalPlan` (see `api.ts` for the exact rule). */
export const computeGoalPlan: ComputeGoalPlan = ({
  course,
  completedLessonIds,
  startLevel,
  goalPlan,
  today,
  dailyGoalXp,
}) => {
  if (!goalPlan) return null;
  const levels = levelsWithContent(course);
  const targetIndex = levels.indexOf(goalPlan.targetLevel);
  if (targetIndex < 0) return null;

  const startIndex = startLevel ? Math.max(levels.indexOf(startLevel), 0) : 0;
  const counted = new Set<CefrLevel | undefined>(
    targetIndex < startIndex ? [goalPlan.targetLevel] : levels.slice(startIndex, targetIndex + 1),
  );

  const completed = new Set(completedLessonIds);
  let lessonsLeft = 0;
  for (const unit of course.units) {
    if (!counted.has(unit.level)) continue;
    for (const lesson of unit.lessons) {
      if (!completed.has(lesson.id)) lessonsLeft += 1;
    }
  }

  const daysLeft = localDateToDayNumber(goalPlan.targetDate) - localDateToDayNumber(today);
  const base = {
    targetLevel: goalPlan.targetLevel,
    targetDate: goalPlan.targetDate,
    lessonsLeft,
    daysLeft,
  };

  if (lessonsLeft === 0 || daysLeft <= 0) {
    const status: GoalPlanState = lessonsLeft === 0 ? "reached" : "date-passed";
    return { ...base, lessonsPerDay: null, suggestedDailyGoalXp: null, status };
  }

  const lessonsPerDay = Math.ceil(lessonsLeft / daysLeft);
  const requiredXp = lessonsPerDay * GAME_CONFIG.xpPerLesson;
  const largest = Math.max(...GAME_CONFIG.dailyGoalOptions);
  const status: GoalPlanState =
    requiredXp <= dailyGoalXp ? "on-track" : requiredXp <= largest ? "raise-goal" : "tight";
  const result: GoalPlanStatus = {
    ...base,
    lessonsPerDay,
    suggestedDailyGoalXp: suggestDailyGoalXp(requiredXp),
    status,
  };
  return result;
};
