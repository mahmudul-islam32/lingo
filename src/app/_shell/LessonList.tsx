"use client";

import Link from "next/link";
import { useEffect, useId } from "react";
import { useStore } from "zustand";
import type { Course, Slug, Unit } from "@/contracts";
import { Button, Card, CheckIcon, Lumi, Skeleton, VisuallyHidden, cn } from "@/components/ui";
import { guestProfileStore } from "@/features/profile";
import { useQueryClient } from "@tanstack/react-query";
import {
  DEFAULT_COURSE_ID,
  lessonPath,
  lessonQueryOptions,
  useContentRepository,
  useCourse,
} from "@/lib/content";
import { useCompletedLessonIds } from "@/lib/offline";

export const LOADING_LESSONS_LABEL = "Loading lessons";
export const COURSE_ERROR_MESSAGE = "We couldn't load the course.";
export const EMPTY_UNIT_MESSAGE = "New lessons are on the way.";

/** The learner's course (from settings), or the default before onboarding. */
function useCourseId(): Slug {
  return useStore(guestProfileStore, (s) => s.settings?.courseId) ?? DEFAULT_COURSE_ID;
}

/**
 * Learn tab, v0.2.0 (PLT-007, PLT-008, PD-009): the unit header and an ordered list of
 * its lessons, all playable, with "Completed" labels from the results saved on this
 * device. Replaced by the skill path (GAM-008) in v0.3.0.
 */
export function LessonList({ courseId: courseIdProp }: { courseId?: Slug }) {
  const settingsCourseId = useCourseId();
  const courseId = courseIdProp ?? settingsCourseId;
  const course = useCourse(courseId);
  const completed = useCompletedLessonIds(courseId);
  usePreloadUnitLessons(course.status === "success" ? course.data : null);

  if (course.status === "error") return <CourseError onRetry={() => void course.refetch()} />;
  // Completion labels appear together with the list (PLT-008 UX notes).
  if (course.status === "pending" || completed.status === "loading") return <LessonsLoading />;

  return (
    <div className="flex flex-col gap-6">
      {course.data.units.map((unit) => (
        <UnitLessons key={unit.id} unit={unit} completedIds={completed.ids} />
      ))}
    </div>
  );
}

/**
 * After an online visit to Learn, load every lesson of the course in the background,
 * so their chunks are cached and the lessons open offline (PLT-007 criterion 7).
 */
function usePreloadUnitLessons(course: Course | null) {
  const repository = useContentRepository();
  const client = useQueryClient();
  useEffect(() => {
    if (!course) return;
    const ids = course.units.flatMap((u) => u.lessons.map((l) => l.id));
    // Fills `["lesson", …]` too, so a lesson opened from Learn renders without a skeleton.
    const run = () => {
      for (const id of ids)
        void client.prefetchQuery(lessonQueryOptions(repository, course.id, id));
    };
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = setTimeout(run, 200);
    return () => clearTimeout(timer);
  }, [course, repository, client]);
}

function UnitLessons({ unit, completedIds }: { unit: Unit; completedIds: ReadonlySet<Slug> }) {
  const headingId = useId();
  const count = unit.lessons.length;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <Card tone="accent" padding="md" className="flex flex-col gap-1">
        <h2 id={headingId} className="text-xl font-bold">
          {unit.title}
        </h2>
        <p className="text-sm">
          {count} {count === 1 ? "lesson" : "lessons"}
        </p>
      </Card>
      {count === 0 ? (
        <Card as="div" padding="lg" className="flex flex-col items-center gap-4 text-center">
          <Lumi pose="idle" size="md" />
          <p className="text-fg-muted">{EMPTY_UNIT_MESSAGE}</p>
        </Card>
      ) : (
        <ol className="flex flex-col gap-3">
          {unit.lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              id={lesson.id}
              number={index + 1}
              title={lesson.title}
              completed={completedIds.has(lesson.id)}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

interface LessonCardProps {
  id: Slug;
  number: number;
  title: string;
  completed: boolean;
}

/**
 * One lesson card. The link's text is "Lesson N: <title>" (criterion 5), and it is
 * stretched over the whole card, so the card opens with one tap or with Enter. The
 * Completed state is the link's description, shown as icon + text (not colour alone).
 */
function LessonCard({ id, number, title, completed }: LessonCardProps) {
  const statusId = useId();
  return (
    <Card
      as="li"
      padding="none"
      data-testid="lesson-card"
      className="relative flex min-h-14 items-center gap-3 p-4 hover:bg-surface-raised motion-safe:transition-colors"
    >
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-border-strong font-bold"
      >
        {number}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <Link
          href={lessonPath(id)}
          // Visible text is "Lesson N" + title; the label only adds the colon (criterion 5).
          aria-label={`Lesson ${number}: ${title}`}
          aria-describedby={completed ? statusId : undefined}
          className={cn(
            "flex flex-col rounded-card focus-visible:outline-none",
            // Stretched link: the whole card is the tap target and shows the focus ring.
            "after:absolute after:inset-0 after:rounded-card focus-visible:after:focus-ring",
          )}
        >
          <span className="text-sm text-fg-muted">Lesson {number}</span>{" "}
          <span className="truncate text-lg font-semibold">{title}</span>
        </Link>
        {completed && (
          <span
            id={statusId}
            className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-success-fg"
          >
            <CheckIcon size={16} />
            Completed
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        className="shrink-0 rounded-control bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
      >
        {completed ? "Start again" : "Start"}
      </span>
    </Card>
  );
}

function LessonsLoading() {
  return (
    <div role="status" aria-label={LOADING_LESSONS_LABEL} className="flex flex-col gap-3">
      <VisuallyHidden>{LOADING_LESSONS_LABEL}</VisuallyHidden>
      <Skeleton shape="rect" className="h-20" />
      <Skeleton shape="rect" className="h-16" />
      <Skeleton shape="rect" className="h-16" />
      <Skeleton shape="rect" className="h-16" />
    </div>
  );
}

function CourseError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card as="section" padding="lg" className="flex flex-col items-center gap-4 text-center">
      <Lumi pose="ember" size="sm" />
      <p className="font-semibold">{COURSE_ERROR_MESSAGE}</p>
      <Button size="lg" onClick={onRetry}>
        Try again
      </Button>
    </Card>
  );
}
