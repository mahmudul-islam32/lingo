"use client";

import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { createContext, createElement, useCallback, useContext, type ReactNode } from "react";
import type { ProgressRepository, Slug } from "@/contracts";
import { queryKeys } from "@/lib/query";
import { getLocalSession } from "./session";

/** How UI code gets the progress repository of this device (opened lazily). */
export type ProgressRepositoryLoader = () => Promise<ProgressRepository>;

export const loadLocalProgress: ProgressRepositoryLoader = async () =>
  (await getLocalSession()).progress;

const ProgressRepositoryContext = createContext<ProgressRepositoryLoader>(loadLocalProgress);

/** Swaps the progress repository below it (tests). */
export function ProgressRepositoryProvider({
  load,
  children,
}: {
  load: ProgressRepositoryLoader;
  children: ReactNode;
}) {
  return createElement(ProgressRepositoryContext, { value: load }, children);
}

export function useProgressRepositoryLoader(): ProgressRepositoryLoader {
  return useContext(ProgressRepositoryContext);
}

/** `["progress", courseId]` → `LessonResult[]`, the raw fact (ADR-005 decision 1). */
export function progressQueryOptions(load: ProgressRepositoryLoader, courseId: Slug) {
  return queryOptions({
    queryKey: queryKeys.progress(courseId),
    queryFn: async () => (await load()).listLessonResults(courseId),
  });
}

/**
 * Invalidates `["progress", courseId]` after a write (e.g. a saved lesson result).
 * `refetchType: "all"` also refreshes inactive queries: the app defaults have
 * `refetchOnMount: false`, so Learn (unmounted during the lesson) would otherwise show
 * the old labels when it mounts again.
 */
export function useInvalidateProgress(): (courseId: Slug) => Promise<void> {
  const client = useQueryClient();
  return useCallback(
    (courseId: Slug) =>
      client.invalidateQueries({ queryKey: queryKeys.progress(courseId), refetchType: "all" }),
    [client],
  );
}
