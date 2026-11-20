"use client";

import { useQuery } from "@tanstack/react-query";
import type { Slug } from "@/contracts";
import { COURSE_REGISTRY, DEFAULT_COURSE_ID } from "@/lib/content";
import { settingsQuery } from "../data/queries";

/**
 * The course the tabs show (GAM-012: Practice and Leagues fetch their own data): the
 * saved `Settings.courseId` when it is a bundled course, else `DEFAULT_COURSE_ID`. The
 * same rule as Learn (PLT-024 AC 7). `pending` while settings are read.
 */
export function useActiveCourseId(): { courseId: Slug; pending: boolean } {
  const settings = useQuery(settingsQuery());
  const saved = settings.data?.courseId;
  const courseId =
    saved && COURSE_REGISTRY.some((course) => course.id === saved) ? saved : DEFAULT_COURSE_ID;
  return { courseId, pending: settings.isPending };
}
