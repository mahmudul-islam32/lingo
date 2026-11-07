"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LessonResult, Slug, Uuid } from "@/contracts";
import { Spinner, VisuallyHidden, useToast } from "@/components/ui";
import {
  LessonPlayer,
  LessonPlayerError,
  LessonPlayerSkeleton,
  type ExerciseComponentMap,
  type LessonSessionSummary,
} from "@/features/lessons";
import { useCourse, useLesson } from "@/lib/content";
import { useProgressRepositoryLoader } from "@/lib/offline";
import { resultFromSummary } from "./finish-lesson";

export const LEARN_PATH = "/";
export const SAVED_TOAST_TITLE = "Lesson complete!";
export const SAVE_FAILED_TOAST_TITLE = "We couldn't save this lesson on your device.";

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
 * Loads the course and the lesson (validated), plays it with the lessons feature's
 * `LessonPlayer` and the real exercise registry, then saves the result on the device
 * (PLT-008) and returns to Learn.
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
  const [finished, setFinished] = useState<LessonResult | null>(null);

  const goToLearn = useCallback(() => router.push(LEARN_PATH), [router]);
  const handleFinish = useCallback(
    (summary: LessonSessionSummary) => {
      // One id per finished session: the idempotency key of the save and of sync.
      setFinished(resultFromSummary(summary, { id: createId() }));
    },
    [createId],
  );

  if (course.status === "error" || lesson.status === "error") {
    return (
      <LessonPlayerError
        onRetry={() => {
          course.retry();
          lesson.retry();
        }}
        onBack={goToLearn}
      />
    );
  }
  if (course.status === "loading" || lesson.status === "loading") return <LessonPlayerSkeleton />;

  if (finished) {
    // LES-008 integration point: once `ResultsScreen` is on main, render
    //   <ResultsScreen result={finished} save={(r) => load().then((p) => p.saveLessonResult(r))}
    //     onContinue={goToLearn} />
    // (Completed labels refresh by themselves: the device repository notifies Learn.)
    // and build `finished` with `toLessonResult` from `@/features/lessons` instead of
    // `resultFromSummary`. Until then: save, then back to Learn with a toast.
    return <SaveAndReturn result={finished} onDone={goToLearn} />;
  }

  return (
    <LessonPlayer
      key={lesson.data.id}
      lesson={lesson.data}
      learningLanguage={course.data.learningLanguage}
      knownLanguage={course.data.knownLanguage}
      onFinish={handleFinish}
      onQuit={goToLearn}
      {...(components ? { components } : {})}
      onRetry={() => {
        course.retry();
        lesson.retry();
      }}
    />
  );
}

/** Temporary end of lesson until LES-008: saves once, shows a toast, goes to Learn. */
function SaveAndReturn({ result, onDone }: { result: LessonResult; onDone: () => void }) {
  const loadProgress = useProgressRepositoryLoader();
  const toast = useToast();
  const savedFor = useRef<string | null>(null);

  useEffect(() => {
    if (savedFor.current === result.id) return; // StrictMode / re-render: save once
    savedFor.current = result.id;
    loadProgress()
      .then((progress) => progress.saveLessonResult(result))
      .then(
        () =>
          toast.show({
            title: SAVED_TOAST_TITLE,
            description: `+${result.xpEarned} XP`,
            tone: "success",
          }),
        () =>
          toast.show({
            title: SAVE_FAILED_TOAST_TITLE,
            description: "Your next lesson will still be saved.",
            tone: "error",
          }),
      )
      .finally(onDone);
  }, [result, loadProgress, toast, onDone]);

  return (
    <main className="flex h-dvh items-center justify-center bg-canvas text-primary">
      <div role="status" aria-label="Saving your lesson">
        <Spinner size="lg" />
        <VisuallyHidden>Saving your lesson</VisuallyHidden>
      </div>
    </main>
  );
}
