"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import type { Course, Lesson, Slug } from "@/contracts";
import { contentRepository, type BundledContentRepository } from "./content-repository";
import { useAsyncResource, type AsyncResource } from "./use-async";

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

/** Course manifest (query key `["content", courseId]` once TanStack Query lands). */
export function useCourse(courseId: Slug): AsyncResource<Course> {
  const repository = useContentRepository();
  const load = useCallback(() => repository.getCourse(courseId), [repository, courseId]);
  return useAsyncResource(load);
}

/** One lesson (query key `["lesson", courseId, lessonId]` once TanStack Query lands). */
export function useLesson(courseId: Slug, lessonId: Slug): AsyncResource<Lesson> {
  const repository = useContentRepository();
  const load = useCallback(
    () => repository.getLesson(courseId, lessonId),
    [repository, courseId, lessonId],
  );
  return useAsyncResource(load);
}
