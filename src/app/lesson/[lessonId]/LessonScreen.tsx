"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { LessonResult, Slug, Uuid } from "@/contracts";
import {
  LessonPlayer,
  LessonPlayerError,
  LessonPlayerSkeleton,
  ResultsScreen,
  toLessonResult,
  type ExerciseComponentMap,
  type LessonSessionSummary,
} from "@/features/lessons";
import { useCourse, useLesson } from "@/lib/content";
import { useInvalidateProgress, useProgressRepositoryLoader } from "@/lib/offline";

export const LEARN_PATH = "/";

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
 * with `LessonPlayer` and the real exercise registry, then shows LES-008's
 * `ResultsScreen`, which saves the result on the device through `ProgressRepository`
 * (PLT-008). After the save, `["progress", courseId]` is invalidated, so Learn shows
 * the new "Completed" label without a reload.
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
  const [finished, setFinished] = useState<LessonResult | null>(null);
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
  if (course.status === "pending" || lesson.status === "pending") return <LessonPlayerSkeleton />;

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
    <LessonPlayer
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
