"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LessonResult, ReviewItem, Uuid } from "@/contracts";
import { Card, Lumi } from "@/components/ui";
import { settingsQuery, useActiveCourseId } from "@/features/gamification";
import {
  LessonPlayerError,
  LessonPlayerSkeleton,
  ResultsScreen,
  ReviewPlayer,
  toLessonResult,
  type ExerciseComponentMap,
} from "@/features/lessons";
import { useContentRepository, useCourse } from "@/lib/content";
import { useInvalidateProgress, useProgressRepositoryLoader } from "@/lib/offline";
import { buttonClassNames } from "../_shell/link-styles";
import { loadReviewItems, type LoadReviewItemsResult } from "./load-review-items";
import { useActiveReviewQueue, type UseReviewQueue } from "./review-deps";

export const PRACTICE_PATH = "/practice";
export const REVIEW_EMPTY_TITLE = "Nothing to review yet.";
export const REVIEW_EMPTY_TEXT = "Answer exercises in any lesson and they come back here.";
export const GO_TO_PRACTICE = "Go to Practice";

export interface ReviewScreenProps {
  /** GAM-015's `useReviewQueue`; injectable for tests. */
  useQueue?: UseReviewQueue;
  createId?: () => Uuid;
  /** Exercise components by type (tests). Default: the lessons registry. */
  components?: ExerciseComponentMap;
}

const defaultCreateId = () => crypto.randomUUID() as Uuid;

type Items = { status: "loading" } | LoadReviewItemsResult;

/**
 * `/review` (PLT-029, ADR-019, PD-079): outside the `(tabs)` group like `/lesson/<id>`, so
 * there is no bottom navigation during play. Reads the active course's ranked review
 * queue, loads the lessons of the candidates in order until it has
 * `GAME_CONFIG.reviewSessionSize` items, then plays them in LES-023's `ReviewPlayer` and
 * shows `ResultsScreen` (review mode by the result's kind). Never runs the path-lock check
 * and works at 0 hearts (the player applies the practice hearts rules). States: loading
 * (player skeleton), empty (Lumi + "Go to Practice"), error (try again / back to
 * Practice), playing, results. All reads are local, so it works offline for lessons that
 * were opened or preloaded before; others are skipped.
 */
export function ReviewScreen({
  useQueue = useActiveReviewQueue,
  createId = defaultCreateId,
  components,
}: ReviewScreenProps) {
  const router = useRouter();
  const { courseId, pending: coursePending } = useActiveCourseId();
  const course = useCourse(courseId);
  const settings = useQuery(settingsQuery());
  const queue = useQueue(courseId);
  const content = useContentRepository();
  const loadProgress = useProgressRepositoryLoader();
  const invalidateProgress = useInvalidateProgress();
  const [items, setItems] = useState<Items>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [finished, setFinished] = useState<LessonResult | null>(null);
  // Bumped by "Try again" / "Review more" to re-run the item load after a queue re-read.
  const [loadKey, setLoadKey] = useState(0);

  const candidates = queue.selection?.candidates;
  useEffect(() => {
    if (coursePending || queue.isPending || queue.error || !candidates) return;
    let cancelled = false;
    // `reread` shows the skeleton before a new load; the first load starts as "loading".
    void loadReviewItems({
      courseId,
      candidates,
      loadLesson: (c, l) => content.getLesson(c, l),
    }).then((next) => {
      if (!cancelled) setItems(next);
    });
    return () => {
      cancelled = true;
    };
  }, [courseId, coursePending, queue.isPending, queue.error, candidates, content, loadKey]);

  const goToPractice = useCallback(() => router.push(PRACTICE_PATH), [router]);
  const reread = useCallback(async () => {
    setItems({ status: "loading" });
    await queue.refetch();
    setLoadKey((k) => k + 1);
  }, [queue]);
  const retry = useCallback(() => {
    void course.refetch();
    void reread();
  }, [course, reread]);
  const save = useCallback(
    async (result: LessonResult) => (await loadProgress()).saveLessonResult(result),
    [loadProgress],
  );
  const handleSaved = useCallback(
    (result: LessonResult) => void invalidateProgress(result.courseId),
    [invalidateProgress],
  );
  const reviewMore = useCallback(() => {
    setFinished(null);
    setAttempt((n) => n + 1);
    void reread();
  }, [reread]);

  if (queue.error || course.status === "error" || items.status === "error") {
    return <LessonPlayerError onRetry={retry} onBack={goToPractice} />;
  }
  if (finished) {
    return (
      <ResultsScreen
        result={finished}
        save={save}
        onSaved={handleSaved}
        onContinue={goToPractice}
        onRetryLesson={reviewMore}
      />
    );
  }
  if (queue.isPending || course.status === "pending" || items.status === "loading") {
    return <LessonPlayerSkeleton />;
  }
  if (items.status === "empty") return <ReviewEmpty />;

  return (
    <ReviewPlayer
      key={attempt}
      items={items.items as ReviewItem[]}
      learningLanguage={course.data.learningLanguage}
      knownLanguage={course.data.knownLanguage}
      onFinish={(summary) => setFinished(toLessonResult(summary, { id: createId() }))}
      onQuit={goToPractice}
      onRetry={retry}
      soundEffectsEnabled={settings.data?.soundEffectsEnabled ?? true}
      {...(components ? { components } : {})}
    />
  );
}

/** AC 8: nothing to review. Focus moves to the heading on load (AC 13). */
function ReviewEmpty() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 text-fg">
      <Card
        tone="default"
        padding="lg"
        className="flex w-full max-w-sm flex-col items-center gap-5 text-center"
      >
        <span className="flex size-28 items-center justify-center rounded-full bg-primary-tint">
          <Lumi pose="idle" size="md" />
        </span>
        <div className="flex flex-col gap-2">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-[1.375rem] leading-tight font-bold focus:outline-none"
          >
            {REVIEW_EMPTY_TITLE}
          </h1>
          <p className="text-fg-muted">{REVIEW_EMPTY_TEXT}</p>
        </div>
        <Link href={PRACTICE_PATH} className={`${buttonClassNames} w-full`}>
          {GO_TO_PRACTICE}
        </Link>
      </Card>
    </main>
  );
}
