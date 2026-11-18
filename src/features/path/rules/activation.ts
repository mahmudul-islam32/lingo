/**
 * What happens when the learner activates a path node (GAM-008 AC7–AC9, PD-018; GAM-011
 * start level and practice at 0 hearts, PD-064, PD-065). Pure: the screen renders the
 * outcome (navigate, toast or dialog).
 */
import type { PathNode, PathNodeState, Slug } from "@/contracts";
import {
  canStartLesson,
  type StartGateConfig,
  type StartGateHearts,
} from "@/features/gamification";

export type PathActivation =
  /** Open `/lesson/<lessonId>`. */
  | { kind: "open"; lessonId: Slug }
  /**
   * The node is locked. `unlockLessonId` is the lesson to finish first (the frontier),
   * or `null` if there is none (only possible with inconsistent nodes).
   */
  | { kind: "locked"; lessonId: Slug; unlockLessonId: Slug | null }
  /** 0 hearts and not practice: the lesson can't start (GAM-008 AC9, GAM-011 AC15). */
  | { kind: "out_of_hearts"; lessonId: Slug };

/**
 * How a node is shown: its state, or `open` for a playable lesson of a level before the
 * start level that is not the frontier (GAM-011 AC7: "Open", not "Start" / "up next").
 */
export type PathNodeDisplay = PathNodeState | "open";

/** True for the states the learner can play (available, in progress, completed). */
export function isPlayable(node: Pick<PathNode, "state">): boolean {
  return node.state !== "locked";
}

/**
 * The frontier node ("up next"): the first `available` or `in_progress` node at or after
 * `startIndex` (`startLessonIndex(course, startLevel)`; 0 without a start level), else
 * `undefined`. Earlier `available` nodes are open skipped-level lessons (ADR-013).
 */
export function findFrontier(nodes: readonly PathNode[], startIndex = 0): PathNode | undefined {
  for (let i = startIndex; i < nodes.length; i++) {
    const node = nodes[i]!;
    if (node.state === "available" || node.state === "in_progress") return node;
  }
  return undefined;
}

/** Display state of `node` given the frontier's lesson id (see `PathNodeDisplay`). */
export function pathNodeDisplay(node: PathNode, frontierId: Slug | null): PathNodeDisplay {
  if (node.state === "available" || node.state === "in_progress") {
    return node.lessonId === frontierId ? node.state : "open";
  }
  return node.state;
}

/**
 * The path's start gate (GAM-011 AC18): locked → never; completed → practice, at any
 * hearts while `practiceCostsHearts` is false; available / in progress / open → only with
 * hearts. `hearts` is a heart count or `{ canStartLesson }` (`HeartsView`).
 */
export function canStartNode(
  node: Pick<PathNode, "state">,
  hearts: StartGateHearts,
  config?: StartGateConfig,
): boolean {
  if (!isPlayable(node)) return false;
  return canStartLesson(hearts, node.state === "completed", config);
}

/**
 * Outcome of activating `node`. Locked wins over the hearts gate (a locked lesson can't
 * start anyway, and the toast explains why); a playable node opens when `canStartNode`
 * says so with `canStartLesson` (`HeartsView.canStartLesson`): a completed one always
 * (practice, PD-065), others only with hearts.
 */
export function resolvePathActivation(
  node: PathNode,
  nodes: readonly PathNode[],
  canStartLesson: boolean,
  startIndex = 0,
): PathActivation {
  if (!isPlayable(node)) {
    return {
      kind: "locked",
      lessonId: node.lessonId,
      unlockLessonId: findFrontier(nodes, startIndex)?.lessonId ?? null,
    };
  }
  if (!canStartNode(node, { canStartLesson })) {
    return { kind: "out_of_hearts", lessonId: node.lessonId };
  }
  return { kind: "open", lessonId: node.lessonId };
}

/** Route of a lesson (GAM-008 AC7). */
export function lessonHref(lessonId: Slug): string {
  return `/lesson/${encodeURIComponent(lessonId)}`;
}
