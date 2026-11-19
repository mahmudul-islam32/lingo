"use client";

import Link from "next/link";
import { useId, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GAME_CONFIG, type Slug } from "@/contracts";
import { Button, Card, Chip, Lumi, Skeleton, VisuallyHidden, cn } from "@/components/ui";
import {
  HeartsMeter,
  progressQuery,
  useActiveCourseId,
  useHearts,
  useUserProgress,
  type UseProgressOptions,
} from "@/features/gamification";
import { useContentRepository } from "@/lib/content";
import { courseQuery } from "../data/course-query";
import { buildPracticeList, lessonHref, type PracticeUnitGroup } from "../rules";
import { LEVEL_EYEBROW_PREFIX } from "../components/copy";
import {
  GO_TO_LEARN_TEXT,
  PRACTICE_EMPTY_TEXT,
  PRACTICE_ERROR_TEXT,
  PRACTICE_INTRO_TEXT,
  PRACTICE_LOADING_TEXT,
  PRACTICE_RETRY_TEXT,
  PRACTICE_TITLE,
  PRACTISE_ACTION_TEXT,
  practiceLessonMeta,
  practiseLessonName,
} from "./copy";

const NO_COMPLETED: readonly Slug[] = [];

/** Link styled as the v2 primary / soft Button (Button itself renders a `<button>`). */
const LINK_BASE =
  "inline-flex shrink-0 items-center justify-center rounded-control font-bold select-none " +
  "focus-visible:focus-ring motion-safe:transition-[background-color,box-shadow,transform] " +
  "motion-safe:duration-100 active:translate-y-0.5";
const PRIMARY_LINK = cn(
  LINK_BASE,
  "min-h-14 px-6 bg-primary text-on-primary shadow-3d-primary hover:bg-primary-hover active:shadow-3d-primary-pressed",
);
const SOFT_LINK = cn(
  LINK_BASE,
  "min-h-12 px-4 text-sm bg-primary-soft text-primary-fg shadow-3d-soft hover:bg-primary-ring active:shadow-3d-soft-pressed",
);

export type PracticeScreenProps = UseProgressOptions;

function Header({ hearts }: { hearts: { current: number; max: number } | null }) {
  return (
    <header className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-[1.75rem] leading-tight font-extrabold text-fg">
          {PRACTICE_TITLE}
        </h1>
        {hearts && (
          <span className="inline-flex min-h-11 items-center rounded-chip border-2 border-danger-border bg-danger-tint px-3">
            <HeartsMeter current={hearts.current} max={hearts.max} tone="rose" />
          </span>
        )}
      </div>
      <p className="text-fg-muted">{PRACTICE_INTRO_TEXT}</p>
    </header>
  );
}

function PracticeSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-3" data-testid="practice-skeleton">
      <VisuallyHidden>{PRACTICE_LOADING_TEXT}</VisuallyHidden>
      <Skeleton shape="rect" className="h-5 w-40" />
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} shape="rect" className="h-18 rounded-card" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card padding="lg" className="flex flex-col items-center gap-4 text-center">
      <Lumi pose="idle" size="md" />
      <p className="font-display text-lg font-bold text-fg">{PRACTICE_EMPTY_TEXT}</p>
      <Link href="/" className={cn(PRIMARY_LINK, "w-full")}>
        {GO_TO_LEARN_TEXT}
      </Link>
    </Card>
  );
}

function UnitGroup({ group }: { group: PracticeUnitGroup }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} data-unit={group.unit.id} className="flex flex-col gap-3">
      <h2 id={headingId} className="flex flex-col">
        <span className="eyebrow text-primary-fg">
          {group.level && (
            <span aria-hidden="true">
              {LEVEL_EYEBROW_PREFIX} {group.level} ·{" "}
            </span>
          )}
          Unit {group.unitNumber}
        </span>
        <span className="sr-only">:</span>{" "}
        <span className="font-display text-xl leading-tight font-bold text-fg">
          {group.unit.title}
        </span>
      </h2>
      <ul className="flex flex-col gap-3">
        {group.lessons.map(({ lesson, lessonNumber }) => (
          <Card
            as="li"
            key={lesson.id}
            padding="none"
            data-lesson={lesson.id}
            className="flex min-h-16 items-center gap-3.5 px-4 py-3"
          >
            <Chip tone="indigo" size="sm" label={`Lesson ${lessonNumber}`}>
              {lessonNumber}
            </Chip>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[1.0625rem] font-bold break-words text-fg">{lesson.title}</span>
              <span className="text-sm text-fg-muted">
                {practiceLessonMeta(group.unitNumber, lessonNumber)}
              </span>
            </span>
            <Link
              href={lessonHref(lesson.id)}
              aria-label={practiseLessonName(lesson.title)}
              className={SOFT_LINK}
            >
              {PRACTISE_ACTION_TEXT}
            </Link>
          </Card>
        ))}
      </ul>
    </section>
  );
}

/**
 * Practice tab (GAM-012 AC6–AC9; PD-065, PD-066 §5): the learner's finished lessons of the
 * active course, grouped by unit, most recent first, each with a "Practise" link to
 * `/lesson/<id>`. The lesson route starts a completed lesson as practice (free, allowed
 * at 0 hearts, correct answers earn hearts), so the link is the same as on the path.
 * Self-contained: reads the active course, its manifest, results and hearts through the
 * feature hooks; `/practice` (PLT-026) renders it with no props.
 */
export function PracticeScreen(options: PracticeScreenProps) {
  const { courseId, pending } = useActiveCourseId();
  const { getCourse } = useContentRepository();
  const course = useQuery({ ...courseQuery(courseId, getCourse), enabled: !pending });
  const { status, progress } = useUserProgress(courseId, options);
  const results = useQuery({ ...progressQuery(courseId), enabled: !pending });
  const hearts = useHearts();

  const completed = status === "success" && progress ? progress.completedLessonIds : NO_COMPLETED;
  const groups = useMemo(
    () => (course.data ? buildPracticeList(course.data, completed, results.data ?? []) : []),
    [course.data, completed, results.data],
  );

  // PD-065: practice is free only while practice costs no hearts.
  const free = !GAME_CONFIG.practiceCostsHearts;
  const view = hearts.view;
  let body;
  if (course.isError || status === "error") {
    body = (
      <Card padding="lg" className="flex flex-col items-center gap-4 text-center">
        <Lumi pose="ember" size="sm" />
        <p role="alert" className="font-display text-lg font-bold text-fg">
          {PRACTICE_ERROR_TEXT}
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            void course.refetch();
            void results.refetch();
          }}
        >
          {PRACTICE_RETRY_TEXT}
        </Button>
      </Card>
    );
  } else if (pending || !course.data || status === "loading") {
    body = <PracticeSkeleton />;
  } else if (groups.length === 0) {
    body = <EmptyState />;
  } else {
    body = groups.map((group) => <UnitGroup key={group.unit.id} group={group} />);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 pb-6" data-testid="practice">
      <Header hearts={free && view ? { current: view.current, max: view.max } : null} />
      {body}
    </div>
  );
}
