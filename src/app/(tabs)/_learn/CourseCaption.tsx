"use client";

import type { Slug } from "@/contracts";
import { useUserProgress } from "@/features/gamification";
import { useCourse } from "@/lib/content";
import { cn } from "@/components/ui";
import { courseCaption, currentLevel } from "./course-caption";

const NO_COMPLETED: readonly Slug[] = [];

export interface CourseCaptionProps {
  courseId: Slug;
  className?: string;
}

/**
 * "German · A1" above the skill path (PLT-024 AC 9): the course name and the learner's
 * current CEFR level, as text (never colour only). Keeps its line height while the
 * course and progress load, so the path doesn't move; the path shows its own loading and
 * error states, so this renders nothing extra for them. A results read error counts as
 * nothing completed, like the path (GAM-008 AC 14).
 */
export function CourseCaption({ courseId, className }: CourseCaptionProps) {
  const course = useCourse(courseId);
  const progress = useUserProgress(courseId);
  const ready = course.status === "success" && progress.status !== "loading";
  const text = ready
    ? courseCaption(
        course.data,
        currentLevel(course.data, progress.progress?.completedLessonIds ?? NO_COMPLETED),
      )
    : null;

  return (
    <p
      data-testid="course-caption"
      className={cn("min-h-5 text-sm font-bold tracking-wide text-fg-muted", className)}
    >
      {text}
    </p>
  );
}
