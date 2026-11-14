"use client";

import { useQuery } from "@tanstack/react-query";
import { VisuallyHidden } from "@/components/ui";
import {
  DailyGoalRing,
  GamificationTopBar,
  StreakLumi,
  settingsQuery,
} from "@/features/gamification";
import { SkillPath } from "@/features/path";
import { useContentRepository } from "@/lib/content";
import { useFlashToast } from "../../_shell/flash-toast";
import { InstallCard } from "../../_shell/InstallCard";
import { CourseCaption } from "./CourseCaption";
import { learnCourseId } from "./course-caption";
import { usePreloadCourseLessons } from "./use-preload-course-lessons";

/**
 * Learn (PLT-009): PLT-005's install card (only when installable), then the v0.3.0
 * gamification loop, top to bottom: the sticky
 * `GamificationTopBar` (GAM-007), a row with `StreakLumi` (GAM-009) and `DailyGoalRing`
 * (GAM-006), then the `SkillPath` (GAM-008). The page adds no spinner or error of its
 * own: each block shows its own skeleton and error state (AC 11).
 *
 * The course is `Settings.courseId` from `["settings"]` (ADR-005), falling back to
 * `DEFAULT_COURSE_ID` (`en-de`) before settings are read or when the course isn't
 * registered any more (PLT-024 AC 7). Guests already on `en-es` keep Spanish (AC 8).
 * Above the path, `CourseCaption` names the course and current level, e.g. "German · A1"
 * (AC 9). Everything reads Dexie and the bundled
 * content, so Learn renders progress offline (AC 7); the course's lessons are preloaded
 * so they open offline too (PLT-007 criterion 7).
 */
export function LearnScreen() {
  const settings = useQuery(settingsQuery());
  const courseId = learnCourseId(settings.data?.courseId);
  const { getCourse } = useContentRepository();
  usePreloadCourseLessons(courseId);
  // E.g. "Finish the earlier lessons first." after a locked lesson's URL (AC 4).
  useFlashToast();

  return (
    <div className="flex flex-col gap-4" data-testid="learn">
      <VisuallyHidden as="h1">Learn</VisuallyHidden>
      <InstallCard />
      <GamificationTopBar courseId={courseId} className="sticky top-0 z-10" />
      <div className="flex items-center justify-between gap-3" data-testid="learn-header">
        <StreakLumi courseId={courseId} className="min-w-0 flex-1" />
        <DailyGoalRing courseId={courseId} className="shrink-0" />
      </div>
      <CourseCaption courseId={courseId} />
      <SkillPath courseId={courseId} loadCourse={getCourse} className="px-0" />
    </div>
  );
}
