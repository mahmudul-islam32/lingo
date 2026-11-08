"use client";

import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, createElement, useCallback, useContext, type ReactNode } from "react";
import type { LessonResult, ProgressRepository, Slug } from "@/contracts";
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

export interface CompletedLessonIds {
  status: "loading" | "ready";
  /** Lessons with at least one saved result. Empty when reading failed (PLT-008 UX). */
  ids: ReadonlySet<Slug>;
}

const EMPTY: ReadonlySet<Slug> = new Set();

function selectCompletedIds(results: LessonResult[]): ReadonlySet<Slug> {
  return new Set(results.map((r) => r.lessonId));
}

/**
 * Distinct `lessonId`s of `listLessonResults(courseId)` (PLT-008 criterion 5), a
 * `select` over `["progress", courseId]` (ADR-005). A read error counts as "nothing
 * completed yet", so the learner can still start every lesson.
 */
export function useCompletedLessonIds(courseId: Slug): CompletedLessonIds {
  const query = useQuery({
    ...progressQueryOptions(useProgressRepositoryLoader(), courseId),
    select: selectCompletedIds,
  });
  if (query.status === "pending") return { status: "loading", ids: EMPTY };
  return { status: "ready", ids: query.data ?? EMPTY };
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
