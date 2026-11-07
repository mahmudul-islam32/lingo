"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ProgressRepository, Slug } from "@/contracts";
import { subscribeProgress } from "./progress-events";
import { getLocalSession } from "./session";

/** How UI code gets the progress repository of this device (lazily opened). */
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

export interface CompletedLessonIds {
  status: "loading" | "ready";
  /** Lessons with at least one saved result. Empty when reading failed (PLT-008 UX). */
  ids: ReadonlySet<Slug>;
}

const EMPTY: ReadonlySet<Slug> = new Set();

/**
 * Distinct `lessonId`s of `listLessonResults(courseId)` (PLT-008 criterion 5). Re-reads
 * after every saved result of this course. A read error is treated as "nothing
 * completed yet" so the learner can still start lessons.
 * (Query key `["progress", courseId]` once TanStack Query is installed.)
 */
export function useCompletedLessonIds(courseId: Slug): CompletedLessonIds {
  const load = useProgressRepositoryLoader();
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<{
    key: string;
    ids: ReadonlySet<Slug>;
  } | null>(null);
  const key = `${courseId}#${version}`;

  useEffect(
    () =>
      subscribeProgress((changed) => {
        if (changed === courseId) setVersion((n) => n + 1);
      }),
    [courseId],
  );

  useEffect(() => {
    let active = true;
    load()
      .then((repository) => repository.listLessonResults(courseId))
      .then(
        (results) => new Set(results.map((r) => r.lessonId)),
        (error: unknown) => {
          console.warn("[offline] could not read completed lessons", error);
          return EMPTY;
        },
      )
      .then((ids) => {
        if (active) setState({ key, ids });
      });
    return () => {
      active = false;
    };
  }, [load, courseId, key]);

  // While a refresh after a save runs, keep showing the previous labels (no flicker).
  if (!state) return { status: "loading", ids: EMPTY };
  if (!state.key.startsWith(`${courseId}#`)) return { status: "loading", ids: EMPTY };
  return { status: "ready", ids: state.ids };
}
