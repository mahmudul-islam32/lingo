"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Slug } from "@/contracts";
import { lessonQueryOptions, useContentRepository, useCourse } from "@/lib/content";

/**
 * After an online visit to Learn, load every lesson of the course in the background, so
 * their chunks are cached and the lessons open offline (PLT-007 criterion 7, moved here
 * from the removed `LessonList` in PLT-009). Fills `["lesson", …]` too, so a lesson
 * opened from the path renders without a skeleton. Reads `["content", courseId]`, the
 * same entry as `SkillPath` (ADR-005).
 */
export function usePreloadCourseLessons(courseId: Slug): void {
  const repository = useContentRepository();
  const client = useQueryClient();
  const course = useCourse(courseId).data;

  useEffect(() => {
    if (!course) return;
    const ids = course.units.flatMap((u) => u.lessons.map((l) => l.id));
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
