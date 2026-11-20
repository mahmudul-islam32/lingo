import type { Ref } from "react";
import type { Course, Slug } from "@/contracts";
import { Button, Chip, Skeleton, VisuallyHidden } from "@/components/ui";
import { RadioCardGroup } from "../../_shell/RadioCardGroup";
import { courseChipTone, courseCode, courseSubtitle } from "../course-labels";
import { StepLayout } from "./StepLayout";

export const COURSE_HEADING = "What do you want to learn?";
export const NO_COURSES_TEXT = "No courses are available right now.";
export const MORE_LANGUAGES_TEXT = "More languages coming soon";
export const COURSE_EYEBROW = "I want to learn";

export type CoursesState =
  { status: "loading" } | { status: "ready"; courses: Course[] } | { status: "error" };

export interface CourseStepProps {
  headingId: string;
  headingRef: Ref<HTMLHeadingElement>;
  courses: CoursesState;
  selected: Slug | null;
  onSelect: (courseId: Slug) => void;
  onRetry: () => void;
  onBack: () => void;
  /** Number of steps in this run (PLT-025: 4 with the start level step). */
  total: number;
  onContinue: () => void;
}

/**
 * Step 2 (design v2 screen 1): "I want to learn" and one OptionCard per available course
 * with its code chip ("DE"), language name and a one-line subtitle (no flags).
 */
export function CourseStep({
  headingId,
  headingRef,
  courses,
  selected,
  onSelect,
  onRetry,
  onBack,
  total,
  onContinue,
}: CourseStepProps) {
  const available = courses.status === "ready" ? courses.courses : [];
  const canContinue = available.some((c) => c.id === selected);

  return (
    <StepLayout
      headingId={headingId}
      headingRef={headingRef}
      title={COURSE_HEADING}
      step={2}
      total={total}
      onBack={onBack}
      eyebrow={COURSE_EYEBROW}
      footer={
        <Button variant="primary" size="lg" fullWidth disabled={!canContinue} onClick={onContinue}>
          Continue
        </Button>
      }
    >
      {courses.status === "loading" ? (
        <div role="status" className="flex flex-col gap-3">
          <VisuallyHidden>Loading courses</VisuallyHidden>
          <Skeleton shape="rect" className="h-18 rounded-card" />
          <Skeleton shape="rect" className="h-18 rounded-card" />
        </div>
      ) : available.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p>{NO_COURSES_TEXT}</p>
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : (
        <RadioCardGroup
          labelledBy={headingId}
          options={available.map((course) => ({
            value: course.id,
            label: course.title,
            description: courseSubtitle(course),
            leading: <Chip tone={courseChipTone(course)}>{courseCode(course)}</Chip>,
          }))}
          value={selected}
          onChange={onSelect}
          footer={<p className="text-sm text-fg-muted">{MORE_LANGUAGES_TEXT}</p>}
        />
      )}
    </StepLayout>
  );
}
