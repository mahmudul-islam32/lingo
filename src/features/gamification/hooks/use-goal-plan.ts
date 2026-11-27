"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GAME_CONFIG, goalPlanFor, type GoalPlanStatus, type Slug } from "@/contracts";
import { useCourse } from "@/lib/content";
import { progressQuery, settingsQuery } from "../data/queries";
import { computeGoalPlan } from "../rules/goal-plan";
import { completedLessonIdsOf } from "../rules/progress";
import { useActiveCourseId } from "./use-active-course-id";
import { useLocalToday, type UseLocalTodayOptions } from "./use-local-today";

export const GOAL_PLAN_READ_WARNING = "[goal-plan] could not read the goal date inputs";

export interface UseGoalPlanOptions extends UseLocalTodayOptions {
  /** Course to plan for. Default: the active course (`useActiveCourseId`, like Learn). */
  courseId?: Slug;
}

/**
 * The goal-date status of one course (GAM-013 AC8, GAM-014, ADR-015 §5, ADR-018 §2),
 * derived on every render from `["settings"]` (that course's plan via
 * `goalPlanFor(settings, courseId)`, plus the global `startLevel` and `dailyGoalXp`), `["progress", courseId]`
 * (completed lessons), `["content", courseId]` (the course) and `useLocalToday`. All
 * reads are local (Dexie + bundled content), so it works for guests and offline; an
 * invalidation of any of those keys or local midnight updates it without a reload.
 *
 * - `undefined` while any input is loading (the card renders nothing, no skeleton).
 * - `null` when there is no goal date, the target level has no content, or a read failed
 *   (logged once per failed read with `console.warn`, no error banner, PD-021 spirit).
 * - Otherwise `computeGoalPlan(...)`. Nothing derived is cached or stored.
 */
export function useGoalPlan(options: UseGoalPlanOptions = {}): GoalPlanStatus | null | undefined {
  const active = useActiveCourseId();
  const courseId = options.courseId ?? active.courseId;
  const settings = useQuery(settingsQuery());
  const results = useQuery(progressQuery(courseId));
  const course = useCourse(courseId);
  const { today } = useLocalToday({ timeZone: options.timeZone });

  const error = settings.error ?? results.error ?? course.error;
  const errorAt = Math.max(settings.errorUpdatedAt, results.errorUpdatedAt, course.errorUpdatedAt);
  useEffect(() => {
    if (error) console.warn(GOAL_PLAN_READ_WARNING, error);
  }, [error, errorAt]);

  // ADR-018 §2: the only way to read a course's plan; honours a legacy v0.5.4 `goalPlan`
  // for the course its record names as active and gives `null` to every other course.
  const goalPlan = settings.data ? goalPlanFor(settings.data, courseId) : null;
  const startLevel = settings.data?.startLevel;
  const dailyGoalXp = settings.data?.dailyGoalXp ?? GAME_CONFIG.defaultDailyGoalXp;
  const completedLessonIds = useMemo(
    () => (results.data ? completedLessonIdsOf(results.data) : null), // GAM-015 AC7
    [results.data],
  );

  return useMemo(() => {
    if (error) return null;
    if (settings.isPending) return undefined;
    if (!goalPlan) return null;
    if (!course.data || !completedLessonIds) return undefined;
    return computeGoalPlan({
      course: course.data,
      completedLessonIds,
      startLevel,
      goalPlan,
      today,
      dailyGoalXp,
    });
  }, [
    error,
    settings.isPending,
    goalPlan,
    course.data,
    completedLessonIds,
    startLevel,
    today,
    dailyGoalXp,
  ]);
}
