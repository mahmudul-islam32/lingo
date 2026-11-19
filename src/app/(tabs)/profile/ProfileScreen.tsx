"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { VisuallyHidden } from "@/components/ui";
import { settingsQuery, useProgressInputs, useUserProgress } from "@/features/gamification";
import {
  effectiveStartLevel,
  joinedLabel,
  ProfileHeader,
  profileDisplayName,
  profileInitials,
  ProfileStats,
  profileSubtitle,
  useGuestProfile,
  WeeklyXpChart,
  weeklyXpByDay,
} from "@/features/profile";
import { useCourse } from "@/lib/content";
import { languageName } from "../../onboarding/course-labels";
import { learnCourseId } from "../_learn/course-caption";
import { DailyGoalRow } from "./DailyGoalRow";
import { StartLevelRow } from "./StartLevelRow";

export const SETTINGS_ID = "settings";

/**
 * Profile (design v2 screen 8, PLT-026), real data only (PD-066 §7): header with avatar,
 * name, course and join date; 2 × 2 stat tiles; "XP this week" from the saved lesson
 * results with the daily-goal line; and the settings rows. Everything reads Dexie through
 * the shared query keys, so values update after a lesson without a reload. No league,
 * words learned or achievements.
 */
export function ProfileScreen() {
  const profile = useGuestProfile((s) => s.profile);
  const settings = useQuery(settingsQuery());
  const courseId = learnCourseId(settings.data?.courseId);
  const course = useCourse(courseId);
  const inputs = useProgressInputs(courseId);
  const { status, progress } = useUserProgress(courseId);

  const days = useMemo(
    () => (inputs.results ? weeklyXpByDay(inputs.results, inputs.today) : null),
    [inputs.results, inputs.today],
  );

  const language = course.data ? languageName(course.data.learningLanguage) : null;
  const subtitle = profileSubtitle(language, joinedLabel(profile));
  const startLevel = course.data
    ? effectiveStartLevel(course.data, settings.data?.startLevel)
    : null;

  return (
    <div className="flex flex-col gap-4.5" data-testid="profile">
      <VisuallyHidden as="h1">Profile</VisuallyHidden>
      <ProfileHeader
        name={profileDisplayName(profile)}
        initials={profileInitials(profile)}
        subtitle={subtitle}
        settingsHref={`#${SETTINGS_ID}`}
      />
      <ProfileStats
        status={status === "success" && course.isPending ? "loading" : status}
        values={
          progress
            ? {
                streakDays: progress.streak.current,
                totalXp: progress.totalXp,
                lessonsDone: progress.lessonsCompletedCount,
                startLevel,
              }
            : null
        }
      />
      {inputs.status === "success" && days ? (
        <WeeklyXpChart status="success" days={days} goalXp={inputs.goalXp} />
      ) : (
        <WeeklyXpChart
          status={inputs.status === "error" ? "error" : "loading"}
          goalXp={inputs.goalXp}
        />
      )}
      <section
        id={SETTINGS_ID}
        aria-labelledby={`${SETTINGS_ID}-heading`}
        tabIndex={-1}
        className="flex scroll-mt-4 flex-col gap-2.5 outline-none"
      >
        <h2 id={`${SETTINGS_ID}-heading`} className="font-display text-base font-extrabold">
          Settings
        </h2>
        <DailyGoalRow />
        <StartLevelRow />
      </section>
    </div>
  );
}
