/**
 * Course manifest query for the skill path (GAM-008). Same key and shape as the shared
 * content query (`["content", courseId]` → `Course`, ADR-005), so when PLT-007's hook
 * lands both read one cache entry. Until then the caller injects the loader
 * (e.g. `contentRepository.getCourse`).
 */
import { queryOptions } from "@tanstack/react-query";
import type { Course, Slug } from "@/contracts";
import { queryKeys } from "@/lib/query";

/** Loads one course manifest, e.g. `ContentRepository.getCourse`. */
export type CourseLoader = (courseId: Slug) => Promise<Course>;

export function courseQuery(courseId: Slug, loadCourse: CourseLoader) {
  return queryOptions({
    queryKey: queryKeys.content(courseId),
    queryFn: () => loadCourse(courseId),
    staleTime: Infinity,
    networkMode: "always",
  });
}
