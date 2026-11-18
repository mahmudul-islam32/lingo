"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CefrLevel, Slug } from "@/contracts";
import { useToast } from "@/components/ui";
import {
  formatHeartRefill,
  settingsQuery,
  useHearts,
  useMinuteClock,
  useUserProgress,
  type UseProgressOptions,
} from "@/features/gamification";
import { courseQuery, type CourseLoader } from "../data/course-query";
import { useSetStartLevel } from "../data/use-set-start-level";
import { computePathNodes } from "../rules";
import { SkillPathError } from "./SkillPathError";
import { SkillPathSkeleton } from "./SkillPathSkeleton";
import { SkillPathView } from "./SkillPathView";
import { START_LEVEL_ERROR_TEXT } from "./copy";

const NO_COMPLETED: readonly Slug[] = [];

export interface SkillPathProps extends UseProgressOptions {
  courseId: Slug;
  /**
   * Loads the course manifest under `["content", courseId]`. Injected until PLT-007's
   * shared content hook is merged (then this becomes optional and defaults to it).
   */
  loadCourse: CourseLoader;
  /**
   * Override for the 0-hearts gate. Default: `useHearts().view.canStartLesson` (GAM-005),
   * or `true` while hearts are still loading.
   */
  canStartLesson?: boolean;
  /**
   * Override for the out-of-hearts dialog text. Default: `formatHeartRefill(view, now)`
   * with a minute clock that only runs while the learner is out of hearts.
   */
  heartRefillText?: string | null;
  /**
   * Override for the start level (GAM-011, ADR-013). Default: `Settings.startLevel` from
   * `["settings"]`; while settings load the skeleton stays, a read error means the first
   * level.
   */
  startLevel?: CefrLevel | null;
  /**
   * Override for "Start here" (saves the start level). Default: `useSetStartLevel()`
   * (profile repository `updateSettings({ startLevel })`, then the `["settings"]` cache).
   * On rejection the path shows the toast "We couldn't change your start level. Try
   * again." and stays as it was.
   */
  onStartHere?: (level: CefrLevel) => Promise<void> | void;
  /** Lesson currently being played, if any (PD-018: none on Learn in MVP). */
  activeLessonId?: Slug | null;
  onNavigate?: (lessonId: Slug) => void;
  className?: string;
}

/**
 * Skill path container (GAM-008 AC4–AC18): composes the course query, `useUserProgress`
 * and the toast queue around the presentational `SkillPathView`.
 *
 * - Course loading (or progress loading) → skeleton. Course error → message + "Try again".
 * - Results can't be read → the path still shows, Lesson 1 available, rest locked (AC14).
 * - A finished lesson invalidates `["progress", courseId]`, so nodes update without a
 *   reload (AC12).
 * - Hearts come from `useHearts()` (AC9, AC10): at 0 hearts playable nodes open the
 *   out-of-hearts dialog with `formatHeartRefill`; a refill reopens the path.
 */
export function SkillPath({
  courseId,
  loadCourse,
  canStartLesson: canStartLessonProp,
  heartRefillText: heartRefillTextProp,
  activeLessonId = null,
  startLevel: startLevelProp,
  onStartHere: onStartHereProp,
  onNavigate,
  className,
  ...progressOptions
}: SkillPathProps) {
  const course = useQuery(courseQuery(courseId, loadCourse));
  const { status, progress } = useUserProgress(courseId, progressOptions);
  const toast = useToast();
  const hearts = useHearts();
  const settings = useQuery({ ...settingsQuery(), enabled: startLevelProp === undefined });
  const setStartLevel = useSetStartLevel();
  const startLevel =
    startLevelProp !== undefined ? startLevelProp : (settings.data?.startLevel ?? null);
  const settingsLoading = startLevelProp === undefined && settings.isPending;

  const canStartLesson = canStartLessonProp ?? hearts.view?.canStartLesson ?? true;
  // Ticks once a minute only while the gate is closed and the text is ours to compute.
  const now = useMinuteClock(heartRefillTextProp === undefined && !canStartLesson);
  const heartRefillText =
    heartRefillTextProp !== undefined
      ? heartRefillTextProp
      : hearts.view
        ? formatHeartRefill(hearts.view, now)
        : null;

  const completed = status === "success" && progress ? progress.completedLessonIds : NO_COMPLETED;
  const nodes = useMemo(
    () =>
      course.data
        ? computePathNodes(course.data, completed, activeLessonId, startLevel ?? undefined)
        : null,
    [course.data, completed, activeLessonId, startLevel],
  );

  const onLockedLesson = useCallback((message: string) => toast.show({ title: message }), [toast]);
  const save = onStartHereProp ?? setStartLevel;
  const onStartHere = useCallback(
    async (level: CefrLevel) => {
      try {
        await save(level);
      } catch (error) {
        console.warn("[path] could not save the start level", error);
        toast.show({ title: START_LEVEL_ERROR_TEXT });
        throw error;
      }
    },
    [save, toast],
  );

  if (course.isError) return <SkillPathError onRetry={() => void course.refetch()} />;
  if (!course.data || !nodes || status === "loading" || settingsLoading) {
    return <SkillPathSkeleton />;
  }

  return (
    <SkillPathView
      course={course.data}
      nodes={nodes}
      startLevel={startLevel}
      onStartHere={onStartHere}
      canStartLesson={canStartLesson}
      heartRefillText={heartRefillText}
      onLockedLesson={onLockedLesson}
      onNavigate={onNavigate}
      className={className}
    />
  );
}
