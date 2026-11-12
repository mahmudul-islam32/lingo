"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GAME_CONFIG,
  type DailyGoalXp,
  type HeartsState,
  type LessonResult,
  type LocalDate,
  type Slug,
  type UserProgress,
} from "@/contracts";
import { heartsQuery, progressQuery, settingsQuery } from "../data/queries";
import { computeUserProgress } from "../rules/progress";
import { useLocalToday, type UseLocalTodayOptions } from "./use-local-today";

export type ProgressStatus = "loading" | "error" | "success";

interface ProgressClock {
  /** The learner's goal; `GAME_CONFIG.defaultDailyGoalXp` before onboarding or if settings fail. */
  goalXp: DailyGoalXp;
  today: LocalDate;
  now: Date;
}

/** Raw inputs of `computeUserProgress` (LES-010 needs them for before/after diffs). */
export type ProgressInputs =
  | ({ status: "loading" | "error"; results: null; hearts: null } & ProgressClock)
  | ({ status: "success"; results: readonly LessonResult[]; hearts: HeartsState } & ProgressClock);

export type UseProgressOptions = UseLocalTodayOptions;

/**
 * Reads the stored results (`["progress", courseId]`), hearts (`["hearts"]`) and settings
 * (`["settings"]`) through `@/lib/offline`, plus today's local date.
 *
 * - `status` is `"error"` if results or hearts can't be read (never throws).
 * - A settings failure or `null` settings (before onboarding) falls back to the default goal.
 */
export function useProgressInputs(
  courseId: Slug,
  options: UseProgressOptions = {},
): ProgressInputs {
  const results = useQuery(progressQuery(courseId));
  const hearts = useQuery(heartsQuery());
  const settings = useQuery(settingsQuery());
  const { today, now } = useLocalToday(options);

  const goalXp: DailyGoalXp = settings.data?.dailyGoalXp ?? GAME_CONFIG.defaultDailyGoalXp;
  const clock = { goalXp, today, now };

  if (results.isError || hearts.isError) {
    return { status: "error", results: null, hearts: null, ...clock };
  }
  if (results.data === undefined || hearts.data === undefined || settings.isPending) {
    return { status: "loading", results: null, hearts: null, ...clock };
  }
  return { status: "success", results: results.data, hearts: hearts.data, ...clock };
}

export interface UserProgressState {
  status: ProgressStatus;
  /** `null` unless `status === "success"`. */
  progress: UserProgress | null;
}

/**
 * The learner's `UserProgress` for a course (GAM-003). Derived with `computeUserProgress`
 * on every change of the cached results/hearts/settings or of the local date, so an
 * invalidation of `["progress", courseId]` / `["hearts"]` or local midnight updates it
 * without a reload. Nothing derived is stored in the query cache (ADR-005).
 */
export function useUserProgress(
  courseId: Slug,
  options: UseProgressOptions = {},
): UserProgressState {
  const inputs = useProgressInputs(courseId, options);
  const { status, results, hearts, goalXp, today, now } = inputs;

  const progress = useMemo(
    () =>
      results && hearts
        ? computeUserProgress({ courseId, results, hearts, goalXp, today, now })
        : null,
    [courseId, results, hearts, goalXp, today, now],
  );

  return { status, progress: status === "success" ? progress : null };
}
