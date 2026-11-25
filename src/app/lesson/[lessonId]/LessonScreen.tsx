"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CefrLevel, Course, LessonResult, Slug, Uuid } from "@/contracts";
import { useToast } from "@/components/ui";
import {
  settingsQuery,
  useActiveCourseId,
  useGoalPlan,
  useUserProgress,
} from "@/features/gamification";
import {
  HeartsLessonPlayer,
  LessonPlayerError,
  LessonPlayerSkeleton,
  ResultsScreen,
  toLessonResult,
  type ExerciseComponentMap,
  type LessonSessionSummary,
} from "@/features/lessons";
import { computePathNodes } from "@/features/path";
import { useCourse, useLesson } from "@/lib/content";
import { useInvalidateProgress, useProgressRepositoryLoader } from "@/lib/offline";
import { queueFlashToast } from "../../_shell/flash-toast";

export const LEARN_PATH = "/";

/** Toast after a locked lesson's URL was opened (PLT-009 AC 4, PD-018). */
export const LOCKED_LESSON_TOAST = "Finish the earlier lessons first.";

/** Path access of the lesson: decided once, when course, progress and settings are known. */
type Access = "checking" | "open" | "locked";

const NO_COMPLETED: readonly Slug[] = [];

/**
 * `locked` when the path rule (`computePathNodes`, GAM-008/GAM-011) locks `lessonId`. The
 * learner's `startLevel` is passed as the path view passes it (ADR-013 Consequences), so
 * an earlier-level or start-level lesson the path shows as playable is never refused.
 */
export function accessOf(
  course: Course,
  completed: readonly Slug[],
  lessonId: Slug,
  startLevel?: CefrLevel,
): Access {
  const node = computePathNodes(course, completed, null, startLevel).find(
    (n) => n.lessonId === lessonId,
  );
  return node?.state === "locked" ? "locked" : "open";
}

/**
 * PLT-025 AC 13/14, PD-065 §3: a lesson is practice when it was completed before this
 * session started. `HeartsLessonPlayer` (LES-020) applies `GAME_CONFIG.practiceCostsHearts`:
 * while it is false, practice costs no hearts and may start at 0 hearts.
 */
export function isPracticeStart(completed: readonly Slug[], lessonId: Slug): boolean {
  return completed.includes(lessonId);
}

export interface LessonScreenProps {
  courseId: Slug;
  lessonId: Slug;
  /** Result id factory, injectable for tests. */
  createId?: () => Uuid;
  /** Exercise components; default the lessons feature's registry. Tests only. */
  components?: ExerciseComponentMap;
}

const defaultCreateId = () => crypto.randomUUID();

/**
 * `/lesson/<id>` (PLT-007): loads the course and the lesson (schema-validated), plays it
 * with `HeartsLessonPlayer` (LES-009, PLT-009) and the real exercise registry, then shows LES-008's
 * `ResultsScreen`, which saves the result on the device through `ProgressRepository`
 * (PLT-008). After the save, `["progress", courseId]` is invalidated, so Learn shows
 * the new "Completed" state without a reload.
 *
 * PLT-009 AC 4: a lesson that is locked on the path (by URL) is never played. Once the
 * course and `useUserProgress` resolve, `computePathNodes` decides; a locked lesson
 * `router.replace`s to Learn, which shows the toast (`queueFlashToast`). A results read error counts as nothing
 * completed (GAM-008 AC 14). The player isn't rendered until this check is done.
 */
export function LessonScreen({
  courseId,
  lessonId,
  createId = defaultCreateId,
  components,
}: LessonScreenProps) {
  const router = useRouter();
  const course = useCourse(courseId);
  const lesson = useLesson(courseId, lessonId);
  const loadProgress = useProgressRepositoryLoader();
  const invalidateProgress = useInvalidateProgress();
  const progress = useUserProgress(courseId);
  // PLT-027 AC 13 / LES-022: the goal-date status for the results screen. It re-derives
  // from ["progress", courseId] once `handleSaved` invalidates it, so it includes this lesson.
  // Only for the active course (the one Learn and Profile plan for, TELC-001 course switch);
  // courses without levels (exam courses, en-es) get `null` from `computeGoalPlan`: no row.
  const activeCourse = useActiveCourseId();
  const lessonGoalPlan = useGoalPlan({ courseId });
  const goalPlan =
    activeCourse.pending || activeCourse.courseId === courseId ? lessonGoalPlan : null;
  const settings = useQuery(settingsQuery());
  const toast = useToast();
  const [finished, setFinished] = useState<LessonResult | null>(null);
  const [access, setAccess] = useState<Access>("checking");
  // PLT-025 AC 13/14: practice when completed before the start, or after a saved finish.
  const [practice, setPractice] = useState(false);
  const [savedHere, setSavedHere] = useState(false);
  // Decided once: finishing this lesson later changes progress, never the access. A
  // settings read error counts as no start level (the first level, ADR-013).
  if (
    access === "checking" &&
    course.status === "success" &&
    progress.status !== "loading" &&
    !settings.isPending
  ) {
    const completed = progress.progress?.completedLessonIds ?? NO_COMPLETED;
    setAccess(accessOf(course.data, completed, lessonId, settings.data?.startLevel));
    setPractice(isPracticeStart(completed, lessonId));
  }

  // Once per mount, also under Strict Mode's double effects.
  const redirected = useRef(false);
  useEffect(() => {
    if (access !== "locked" || redirected.current) return;
    redirected.current = true;
    // Shown by Learn, also if the redirect becomes a full page load (offline).
    queueFlashToast(LOCKED_LESSON_TOAST, (title) => toast.show({ title }));
    router.replace(LEARN_PATH);
  }, [access, toast, router]);
  // Bumped by "Practice again" to start a fresh session of the same lesson.
  const [attempt, setAttempt] = useState(0);

  const goToLearn = useCallback(() => router.push(LEARN_PATH), [router]);
  const retryLoad = useCallback(() => {
    void course.refetch();
    void lesson.refetch();
  }, [course, lesson]);
  const handleFinish = useCallback(
    // One id per finished session: the idempotency key of the save and of sync.
    (summary: LessonSessionSummary) => setFinished(toLessonResult(summary, { id: createId() })),
    [createId],
  );
  const save = useCallback(
    async (result: LessonResult) => (await loadProgress()).saveLessonResult(result),
    [loadProgress],
  );
  const handleSaved = useCallback(
    (result: LessonResult) => {
      setSavedHere(true);
      void invalidateProgress(result.courseId);
    },
    [invalidateProgress],
  );
  const practiceAgain = useCallback(() => {
    // AC 14: once this session's result is saved, the lesson is completed: a new start is practice.
    if (savedHere) setPractice(true);
    setFinished(null);
    setAttempt((n) => n + 1);
  }, [savedHere]);

  // LES-020 AC 15: the out-of-hearts screen points to practice when a lesson is finished.
  const hasCompletedLessons = savedHere || (progress.progress?.completedLessonIds.length ?? 0) > 0;

  if (course.status === "error" || lesson.status === "error") {
    return <LessonPlayerError onRetry={retryLoad} onBack={goToLearn} />;
  }
  if (course.status === "pending" || lesson.status === "pending" || access !== "open") {
    return <LessonPlayerSkeleton />;
  }

  if (finished) {
    return (
      <ResultsScreen
        result={finished}
        save={save}
        onSaved={handleSaved}
        onContinue={goToLearn}
        onRetryLesson={practiceAgain}
        goalPlan={goalPlan}
      />
    );
  }

  return (
    // Keyed by lesson (and attempt, so "Practice again" re-reads hearts on a fresh start).
    <HeartsLessonPlayer
      key={`${lesson.data.id}#${attempt}`}
      practice={practice}
      hasCompletedLessons={hasCompletedLessons}
      lesson={lesson.data}
      learningLanguage={course.data.learningLanguage}
      knownLanguage={course.data.knownLanguage}
      onFinish={handleFinish}
      onQuit={goToLearn}
      onRetry={retryLoad}
      // LES-012: on by default (DEFAULT_SETTINGS); Profile → Sound effects turns it off.
      soundEffectsEnabled={settings.data?.soundEffectsEnabled ?? true}
      {...(components ? { components } : {})}
    />
  );
}
