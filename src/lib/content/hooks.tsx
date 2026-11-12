"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";
import type { ContentRepository, Slug } from "@/contracts";
import { queryKeys } from "@/lib/query";
import { contentRepository, type BundledContentRepository } from "./content-repository";

const ContentRepositoryContext = createContext<BundledContentRepository>(contentRepository);

/** Swaps the repository below it (tests use the fixture course). */
export function ContentRepositoryProvider({
  repository,
  children,
}: {
  repository: BundledContentRepository;
  children: ReactNode;
}) {
  return <ContentRepositoryContext value={repository}>{children}</ContentRepositoryContext>;
}

export function useContentRepository(): BundledContentRepository {
  return useContext(ContentRepositoryContext);
}

/** `["content", courseId]` → `Course` (ADR-005). Offline defaults from `@/lib/query`. */
export function courseQueryOptions(repository: ContentRepository, courseId: Slug) {
  return queryOptions({
    queryKey: queryKeys.content(courseId),
    queryFn: () => repository.getCourse(courseId),
  });
}

/** `["lesson", courseId, lessonId]` → `Lesson` (ADR-005). */
export function lessonQueryOptions(repository: ContentRepository, courseId: Slug, lessonId: Slug) {
  return queryOptions({
    queryKey: queryKeys.lesson(courseId, lessonId),
    queryFn: () => repository.getLesson(courseId, lessonId),
  });
}

/** The course manifest, validated against `CourseSchema`. */
export function useCourse(courseId: Slug) {
  return useQuery(courseQueryOptions(useContentRepository(), courseId));
}

/** One lesson, validated against `LessonSchema`. */
export function useLesson(courseId: Slug, lessonId: Slug) {
  return useQuery(lessonQueryOptions(useContentRepository(), courseId, lessonId));
}
