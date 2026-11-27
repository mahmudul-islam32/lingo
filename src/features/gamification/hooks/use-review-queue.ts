"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ReviewCandidate, Slug } from "@/contracts";
import { useCourse } from "@/lib/content";
import { progressQuery } from "../data/queries";
import { selectReviewItems } from "../rules/review";
import { useActiveCourseId } from "./use-active-course-id";
import { useLocalToday, type UseLocalTodayOptions } from "./use-local-today";

export const REVIEW_QUEUE_READ_WARNING = "[review] could not read the review inputs";

export interface UseReviewQueueOptions extends UseLocalTodayOptions {
  /** Course to review. Default: the active course (`useActiveCourseId`, like Practice). */
  courseId?: Slug;
}

export interface ReviewQueue {
  status: "loading" | "error" | "success";
  /** Ranked candidates (`selectReviewItems`); empty unless `status === "success"`. */
  candidates: readonly ReviewCandidate[];
  /** Eligible exercises due today; 0 unless `status === "success"`. */
  dueCount: number;
  /** Eligible exercises (due or not); 0 unless `status === "success"`. */
  eligibleCount: number;
}

const NO_CANDIDATES: readonly ReviewCandidate[] = [];

/**
 * The smart review queue of a course (GAM-015 AC8, ADR-019 §5), derived on every render
 * from `["progress", courseId]` (the stored results and their `exerciseOutcomes`),
 * `["content", courseId]` (the manifest) and `useLocalToday`. All reads are local (Dexie +
 * bundled content), so it works offline and for guests; an invalidation of either key or
 * local midnight updates it without a reload. Nothing derived is stored.
 *
 * A read error is logged once per failed read (`console.warn`) and gives `status: "error"`.
 */
export function useReviewQueue(options: UseReviewQueueOptions = {}): ReviewQueue {
  const active = useActiveCourseId();
  const courseId = options.courseId ?? active.courseId;
  const pending = options.courseId === undefined && active.pending;
  const results = useQuery({ ...progressQuery(courseId), enabled: !pending });
  const course = useCourse(courseId);
  const { today } = useLocalToday({ timeZone: options.timeZone });

  const error = results.error ?? course.error;
  const errorAt = Math.max(results.errorUpdatedAt, course.errorUpdatedAt);
  useEffect(() => {
    if (error) console.warn(REVIEW_QUEUE_READ_WARNING, error);
  }, [error, errorAt]);

  return useMemo((): ReviewQueue => {
    if (error) return { status: "error", candidates: NO_CANDIDATES, dueCount: 0, eligibleCount: 0 };
    if (pending || !results.data || !course.data) {
      return { status: "loading", candidates: NO_CANDIDATES, dueCount: 0, eligibleCount: 0 };
    }
    const selection = selectReviewItems({ course: course.data, results: results.data, today });
    return { status: "success", ...selection };
  }, [error, pending, results.data, course.data, today]);
}
