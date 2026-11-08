/**
 * What happens when the learner activates a path node (GAM-008 AC7–AC9, PD-018).
 * Pure: the screen renders the outcome (navigate, toast or dialog).
 */
import type { PathNode, Slug } from "@/contracts";

export type PathActivation =
  /** Open `/lesson/<lessonId>`. */
  | { kind: "open"; lessonId: Slug }
  /**
   * The node is locked. `unlockLessonId` is the lesson to finish first (the frontier),
   * or `null` if there is none (only possible with inconsistent nodes).
   */
  | { kind: "locked"; lessonId: Slug; unlockLessonId: Slug | null }
  /** 0 hearts: the lesson can't start (GAM-008 AC9). */
  | { kind: "out_of_hearts"; lessonId: Slug };

/** True for the states the learner can play (available, in progress, completed). */
export function isPlayable(node: Pick<PathNode, "state">): boolean {
  return node.state !== "locked";
}

/** The frontier node: the `available` or `in_progress` one, else `undefined`. */
export function findFrontier(nodes: readonly PathNode[]): PathNode | undefined {
  return nodes.find((node) => node.state === "available" || node.state === "in_progress");
}

/**
 * Outcome of activating `node`. Locked wins over the hearts gate (a locked lesson can't
 * start anyway, and the toast explains why); a playable node opens only when
 * `canStartLesson` (`HeartsView.canStartLesson`) is true.
 */
export function resolvePathActivation(
  node: PathNode,
  nodes: readonly PathNode[],
  canStartLesson: boolean,
): PathActivation {
  if (!isPlayable(node)) {
    return {
      kind: "locked",
      lessonId: node.lessonId,
      unlockLessonId: findFrontier(nodes)?.lessonId ?? null,
    };
  }
  if (!canStartLesson) return { kind: "out_of_hearts", lessonId: node.lessonId };
  return { kind: "open", lessonId: node.lessonId };
}

/** Route of a lesson (GAM-008 AC7). */
export function lessonHref(lessonId: Slug): string {
  return `/lesson/${encodeURIComponent(lessonId)}`;
}
