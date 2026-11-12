"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Slug } from "@/contracts";
import { useToast } from "@/components/ui";
import {
  formatHeartRefill,
  useHearts,
  useMinuteClock,
  useUserProgress,
  type UseProgressOptions,
} from "@/features/gamification";
import { courseQuery, type CourseLoader } from "../data/course-query";
import { computePathNodes } from "../rules";
import { SkillPathError } from "./SkillPathError";
import { SkillPathSkeleton } from "./SkillPathSkeleton";
import { SkillPathView } from "./SkillPathView";

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
  onNavigate,
  className,
  ...progressOptions
}: SkillPathProps) {
  const course = useQuery(courseQuery(courseId, loadCourse));
  const { status, progress } = useUserProgress(courseId, progressOptions);
  const toast = useToast();
  const hearts = useHearts();

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
    () => (course.data ? computePathNodes(course.data, completed, activeLessonId) : null),
    [course.data, completed, activeLessonId],
  );

  const onLockedLesson = useCallback((message: string) => toast.show({ title: message }), [toast]);

  if (course.isError) return <SkillPathError onRetry={() => void course.refetch()} />;
  if (!course.data || !nodes || status === "loading") return <SkillPathSkeleton />;

  return (
    <SkillPathView
      course={course.data}
      nodes={nodes}
      canStartLesson={canStartLesson}
      heartRefillText={heartRefillText}
      onLockedLesson={onLockedLesson}
      onNavigate={onNavigate}
      className={className}
    />
  );
}
