/**
 * "Lesson results changed" notifications (PLT-008 criterion 6): Learn re-reads its
 * Completed labels after a save, without a reload. Stand-in for invalidating the
 * `["progress", courseId]` query once TanStack Query is installed (ARCHITECTURE §5).
 */
import type { Slug } from "@/contracts";

export type ProgressListener = (courseId: Slug) => void;

const listeners = new Set<ProgressListener>();

export function subscribeProgress(listener: ProgressListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyProgressChanged(courseId: Slug): void {
  for (const listener of [...listeners]) listener(courseId);
}
