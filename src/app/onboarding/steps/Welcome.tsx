import type { Ref } from "react";
import type { Slug } from "@/contracts";
import { Button, Lumi } from "@/components/ui";
import { APP_NAME } from "../../_shell/app-name";
import { DEFAULT_COURSE_ID, useCourse } from "@/lib/content";
import { languageName } from "../course-labels";
import { StepLayout } from "./StepLayout";

/** "Learn German in five minutes a day.": the language name comes from the course data. */
export function welcomeHeading(language: string): string {
  return `Learn ${language} in five minutes a day.`;
}

/** Shown until the default course is read (or if it can't be read). Names no language. */
export const WELCOME_FALLBACK_HEADING = "Learn a language in five minutes a day.";

export const WELCOME_SUBLINE = "Short lessons, real progress.";

export interface WelcomeProps {
  headingId: string;
  headingRef: Ref<HTMLHeadingElement>;
  onStart: () => void;
  /** Course whose language the heading names (PLT-024 AC 3). Default `DEFAULT_COURSE_ID`. */
  courseId?: Slug;
}

/**
 * Step 1 (design v2 screen 1, PLT-026): Lumi with the Polyglow wordmark (never the
 * design's "parla" logo, PD-066 §8), the big display headline, a muted subline and the
 * primary "Get started". No "I already have an account" link until accounts exist
 * (PD-011, PLT-018).
 * The heading names the learning language of the default course (PLT-024 AC 3), read
 * from the bundled course data with `useCourse`, never hard-coded; a static fallback
 * that names no language is shown while it loads.
 */
export function Welcome({
  headingId,
  headingRef,
  onStart,
  courseId = DEFAULT_COURSE_ID,
}: WelcomeProps) {
  const course = useCourse(courseId);
  const title = course.data
    ? welcomeHeading(languageName(course.data.learningLanguage))
    : WELCOME_FALLBACK_HEADING;

  return (
    <StepLayout
      headingId={headingId}
      headingRef={headingRef}
      title={title}
      step={1}
      headingSize="display"
      subline={WELCOME_SUBLINE}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={onStart}>
          Get started
        </Button>
      }
      hero={
        <div className="flex items-center gap-2.5" data-testid="wordmark">
          <Lumi pose="happy" size="sm" />
          <span className="font-display text-[1.75rem] leading-none font-extrabold tracking-[-0.02em]">
            {APP_NAME}
          </span>
        </div>
      }
    />
  );
}
