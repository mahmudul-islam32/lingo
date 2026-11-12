"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Course, LessonResult, Slug, Uuid } from "@/contracts";
import { useToast } from "@/components/ui";
import { useUserProgress } from "@/features/gamification";
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

/** Path access of the lesson: decided once, when course and progress are known. */
type Access = "checking" | "open" | "locked";

const NO_COMPLETED: readonly Slug[] = [];

/** `locked` when the path rule (`computePathNodes`, GAM-008) locks `lessonId`. */
function accessOf(course: Course, completed: readonly Slug[], lessonId: Slug): Access {
  const node = computePathNodes(course, completed, null).find((n) => n.lessonId === lessonId);
  return node?.state === "locked" ? "locked" : "open";
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
  const toast = useToast();
  const [finished, setFinished] = useState<LessonResult | null>(null);
  const [access, setAccess] = useState<Access>("checking");
  // Decided once: finishing this lesson later changes progress, never the access.
  if (access === "checking" && course.status === "success" && progress.status !== "loading") {
    const completed = progress.progress?.completedLessonIds ?? NO_COMPLETED;
    setAccess(accessOf(course.data, completed, lessonId));
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
    (result: LessonResult) => void invalidateProgress(result.courseId),
    [invalidateProgress],
  );
  const practiceAgain = useCallback(() => {
    setFinished(null);
    setAttempt((n) => n + 1);
  }, []);

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
      />
    );
  }

  return (
    // Keyed by lesson (and attempt, so "Practice again" re-reads hearts on a fresh start).
    <HeartsLessonPlayer
      key={`${lesson.data.id}#${attempt}`}
      lesson={lesson.data}
      learningLanguage={course.data.learningLanguage}
      knownLanguage={course.data.knownLanguage}
      onFinish={handleFinish}
      onQuit={goToLearn}
      onRetry={retryLoad}
      {...(components ? { components } : {})}
    />
  );
}
