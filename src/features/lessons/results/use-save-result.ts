"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LessonResultSchema, type LessonResult, type ProgressRepository } from "@/contracts";

export type SaveResultStatus = "saving" | "saved" | "error";

/** `ProgressRepository.saveLessonResult` (PLT-008), or anything with the same shape. */
export type SaveLessonResult = ProgressRepository["saveLessonResult"];

export interface UseSaveResult {
  status: SaveResultStatus;
  /**
   * Re-runs the save with the same result (same id, so PLT-008 stays idempotent). Does
   * nothing unless the last save failed.
   */
  retry: () => void;
}

/**
 * Saves a finished lesson's result in the background (LES-008 criteria 6 and 7).
 *
 * - Exactly one automatic save per `result.id`: re-renders, a new `save` function
 *   identity and StrictMode's double effect never save twice.
 * - The result is parsed with `LessonResultSchema` first; an invalid result is an error.
 * - `onSaved` runs after a successful save; the route uses it to invalidate
 *   `["progress", courseId]` once TanStack Query is installed (see the ticket notes).
 */
export function useSaveResult(
  result: LessonResult,
  save: SaveLessonResult,
  onSaved?: (result: LessonResult) => void,
): UseSaveResult {
  const [state, setState] = useState<{ id: string; status: SaveResultStatus }>({
    id: result.id,
    status: "saving",
  });
  const savedFor = useRef<string | null>(null);
  const saveRef = useRef(save);
  const onSavedRef = useRef(onSaved);

  useEffect(() => {
    saveRef.current = save;
    onSavedRef.current = onSaved;
  });

  const run = useCallback((r: LessonResult) => {
    Promise.resolve()
      .then(() => saveRef.current(LessonResultSchema.parse(r)))
      .then(
        () => {
          setState({ id: r.id, status: "saved" });
          onSavedRef.current?.(r);
        },
        () => setState({ id: r.id, status: "error" }),
      );
  }, []);

  useEffect(() => {
    if (savedFor.current === result.id) return;
    savedFor.current = result.id;
    run(result);
  }, [result, run]);

  // A new result id starts as "saving" until its own save settles.
  const status = state.id === result.id ? state.status : "saving";

  const retry = useCallback(() => {
    if (status !== "error") return; // no parallel saves from double clicks
    setState({ id: result.id, status: "saving" });
    run(result);
  }, [status, result, run]);

  return { status, retry };
}
