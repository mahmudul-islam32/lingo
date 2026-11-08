/**
 * Learner-facing text of the skill path (GAM-008 AC4–AC10, AC13–AC15). Kept in one place
 * so the screen and its tests share it. Kind wording only (PD-018: no "you failed").
 */
import type { PathNodeState } from "@/contracts";

/** Visible state text under a node (AC5). */
export const STATE_TEXT: Record<PathNodeState, string> = {
  completed: "Completed",
  available: "Start",
  locked: "Locked",
  in_progress: "Continue",
};

/** Suffix of the accessible name per state (AC6). */
const STATE_NAME: Record<PathNodeState, string> = {
  completed: "completed",
  available: "up next",
  locked: "locked",
  in_progress: "in progress",
};

/** Extra action text on completed nodes (AC7). */
export const REPLAY_TEXT = "Start again";

/** "Lesson 2: Nice to Meet You, up next" (AC6). */
export function nodeAccessibleName(number: number, title: string, state: PathNodeState): string {
  return `Lesson ${number}: ${title}, ${STATE_NAME[state]}`;
}

/** "Lesson 2" (AC4). */
export function lessonNumberText(number: number): string {
  return `Lesson ${number}`;
}

/** "3 of 5 lessons completed" (AC4). Singular for a one-lesson unit. */
export function unitProgressText(completed: number, total: number): string {
  return `${completed} of ${total} ${total === 1 ? "lesson" : "lessons"} completed`;
}

/** Toast for a locked node (AC8). `null` when there is no lesson to finish first. */
export function lockedToastText(unlockLessonNumber: number | null): string {
  return unlockLessonNumber === null
    ? "Finish the earlier lessons to unlock this one."
    : `Finish Lesson ${unlockLessonNumber} to unlock this one.`;
}

export const NO_HEARTS_TEXT = "No hearts left";
export const OUT_OF_HEARTS_TITLE = "You're out of hearts";
/** Used only when the caller has no refill time to show (hearts always refill, PD-003). */
export const OUT_OF_HEARTS_FALLBACK = "Your hearts refill over time.";
export const OK_TEXT = "OK";
export const LOADING_TEXT = "Loading your path";
export const COURSE_ERROR_TEXT = "We couldn't load the course.";
export const RETRY_TEXT = "Try again";
export const EMPTY_UNIT_TEXT = "New lessons are on the way.";
