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

/**
 * Visible action text of a node, when it differs from the state word of its name:
 * "Start", "Continue", "Start again". Locked nodes show "Locked", already in the name.
 */
function nodeActionText(state: PathNodeState): string | null {
  switch (state) {
    case "completed":
      return REPLAY_TEXT;
    case "locked":
      return null;
    default:
      return STATE_TEXT[state];
  }
}

/**
 * Accessible name of a node (AC6 + FIX-002, WCAG 2.5.3 Label in Name): starts with
 * "Lesson N: <title>, <state>" and then contains the rest of the visible text, in the
 * visible order (matching ignores case and punctuation):
 * - "Lesson 2: Nice to Meet You, up next. Start"
 * - "Lesson 1: Hello!, completed. Start again" (visible "Completed · Start again")
 * - "Lesson 3: At the Café, in progress. Continue"
 * - "Lesson 5: Around Town, locked" (visible "Locked")
 *
 * GAM-010: in a course with CEFR levels, lessons are numbered within their unit and the
 * name starts with the unit: "Unit 3, Lesson 2: Bread, up next. Start" (visible
 * "Unit 3 · Lesson 2", so the visible label still starts the name).
 */
export function nodeAccessibleName(
  number: number,
  title: string,
  state: PathNodeState,
  unitNumber: number | null = null,
): string {
  const base = `${lessonPrefix(number, unitNumber, ", ")}: ${title}, ${STATE_NAME[state]}`;
  const action = nodeActionText(state);
  return action === null ? base : `${base}. ${action}`;
}

function lessonPrefix(number: number, unitNumber: number | null, separator: string): string {
  return unitNumber === null
    ? `Lesson ${number}`
    : `Unit ${unitNumber}${separator}Lesson ${number}`;
}

/** "Lesson 2" (GAM-008 AC4), or "Unit 3 · Lesson 2" in a course with levels (GAM-010). */
export function lessonNumberText(number: number, unitNumber: number | null = null): string {
  return lessonPrefix(number, unitNumber, " · ");
}

/** "3 of 5 lessons completed" (AC4). Singular for a one-lesson unit. */
export function unitProgressText(completed: number, total: number): string {
  return `${completed} of ${total} ${total === 1 ? "lesson" : "lessons"} completed`;
}

/**
 * Toast for a locked node (AC8). `null` when there is no lesson to finish first. With a
 * unit number (GAM-010 AC5): "Finish Unit 2, Lesson 4 to unlock this one."
 */
export function lockedToastText(
  unlockLessonNumber: number | null,
  unlockUnitNumber: number | null = null,
): string {
  return unlockLessonNumber === null
    ? "Finish the earlier lessons to unlock this one."
    : `Finish ${lessonPrefix(unlockLessonNumber, unlockUnitNumber, ", ")} to unlock this one.`;
}

/** "Unit 3" in a unit header (GAM-010 AC4). */
export function unitNumberText(number: number): string {
  return `Unit ${number}`;
}

/** Shown for a declared level without units (GAM-010 AC3). */
export const COMING_SOON_TEXT = "Coming soon";

export const NO_HEARTS_TEXT = "No hearts left";
export const OUT_OF_HEARTS_TITLE = "You're out of hearts";
/** Used only when the caller has no refill time to show (hearts always refill, PD-003). */
export const OUT_OF_HEARTS_FALLBACK = "Your hearts refill over time.";
export const OK_TEXT = "OK";
export const LOADING_TEXT = "Loading your path";
export const COURSE_ERROR_TEXT = "We couldn't load the course.";
export const RETRY_TEXT = "Try again";
export const EMPTY_UNIT_TEXT = "New lessons are on the way.";
