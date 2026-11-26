/**
 * Aggregate progress rule (GAM-003, ARCHITECTURE §7). Pure: `today` and `now` are passed
 * in. Composes the GAM-002 rules; it holds no XP, heart or goal numbers of its own.
 */
import {
  isReviewResult,
  type ComputeUserProgress,
  type LessonResult,
  type LocalDate,
  type Slug,
  type UserProgress,
} from "@/contracts";
import { computeDailyGoalProgress } from "./daily-goal";
import { refillHearts } from "./hearts";
import { computeStreak } from "./streak";

/**
 * Contract rule `ComputeUserProgress`.
 *
 * - Only results with `courseId === input.courseId` count (others are ignored).
 * - `totalXp`: sum of `xpEarned`, replays included (PD-008).
 * - `completedLessonIds`: each lesson with at least one result, once, in the order of its
 *   first result in `results`; `lessonsCompletedCount` is its length. Review results
 *   (`isReviewResult`, GAM-015 AC7, ADR-019 §3) never add to it, but their XP and date
 *   count for `totalXp`, today's XP, the daily goal and the streak.
 * - `streak`: `computeStreak` over the distinct `localDate`s of the course results.
 * - `hearts`: the stored state after `refillHearts(state, now)` (lazy refill).
 * - `dailyGoal`: `computeDailyGoalProgress` with the learner's goal and `today`;
 *   `dailyGoal.earnedXp` is "today's XP".
 *
 * Single pass over the results, so 1,000 results stay well under a millisecond budget.
 */
export const computeUserProgress: ComputeUserProgress = ({
  courseId,
  results,
  hearts,
  goalXp,
  today,
  now,
}): UserProgress => {
  const courseResults: LessonResult[] = [];
  const lessonIds = new Set<Slug>();
  const activeDates = new Set<LocalDate>();
  let totalXp = 0;

  for (const result of results) {
    if (result.courseId !== courseId) continue;
    courseResults.push(result);
    totalXp += result.xpEarned;
    if (!isReviewResult(result)) lessonIds.add(result.lessonId);
    activeDates.add(result.localDate);
  }

  const completedLessonIds = [...lessonIds];
  return {
    courseId,
    totalXp,
    completedLessonIds,
    lessonsCompletedCount: completedLessonIds.length,
    streak: computeStreak([...activeDates], today),
    hearts: refillHearts(hearts, now),
    dailyGoal: computeDailyGoalProgress(courseResults, goalXp, today),
  };
};
