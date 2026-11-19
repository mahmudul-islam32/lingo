/**
 * Learner-facing text of the skill path (GAM-008 AC4–AC10, AC13–AC15). Kept in one place
 * so the screen and its tests share it. Kind wording only (PD-018: no "you failed").
 */
import type { CourseLevel } from "@/contracts";
import type { PathNodeDisplay } from "../rules";

/** Visible state text under a node (AC5; "Open" for skipped-level lessons, GAM-011 AC7). */
export const STATE_TEXT: Record<PathNodeDisplay, string> = {
  completed: "Completed",
  available: "Start",
  locked: "Locked",
  in_progress: "Continue",
  open: "Open",
};

/** Suffix of the accessible name per state (AC6, GAM-011 AC7). */
const STATE_NAME: Record<PathNodeDisplay, string> = {
  completed: "completed",
  available: "up next",
  locked: "locked",
  in_progress: "in progress",
  open: "open",
};

/** Extra action text on completed nodes (AC7). */
export const REPLAY_TEXT = "Start again";

/**
 * Visible action text of a node, when it differs from the state word of its name:
 * "Start", "Continue", "Start again". Locked nodes show "Locked", already in the name.
 */
function nodeActionText(state: PathNodeDisplay): string | null {
  switch (state) {
    case "completed":
      return REPLAY_TEXT;
    case "locked":
    case "open":
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
 * - "Lesson 1: Hello!, open" (visible "Open": a skipped-level lesson, GAM-011 AC7)
 *
 * GAM-010: in a course with CEFR levels, lessons are numbered within their unit and the
 * name starts with the unit: "Unit 3, Lesson 2: Bread, up next. Start" (visible
 * "Unit 3 · Lesson 2", so the visible label still starts the name).
 */
export function nodeAccessibleName(
  number: number,
  title: string,
  state: PathNodeDisplay,
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

/**
 * Pill above the current node (GAM-012 AC3, screen 2): "Start · Lesson 3", or
 * "Continue · Lesson 3" for a lesson in progress. `number` is the lesson number in its
 * unit (courses with levels) or in the course (courses without levels).
 */
export function nodePillText(state: "available" | "in_progress", number: number): string {
  return `${state === "in_progress" ? STATE_TEXT.in_progress : STATE_TEXT.available} · Lesson ${number}`;
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
/** Visual prefix of a unit banner eyebrow, "LEVEL A1 · UNIT 2" (GAM-012 AC2). */
export const LEVEL_EYEBROW_PREFIX = "Level";

export const COMING_SOON_TEXT = "Coming soon";

export const NO_HEARTS_TEXT = "No hearts left";
/** At 0 hearts on a completed node: practice is free and earns hearts (GAM-011 AC16). */
export const PRACTICE_EARNS_HEARTS_TEXT = "Practice: earns hearts";
/** Extra line of the out-of-hearts dialog with a completed lesson (GAM-011 AC17, PD-065). */
export const PRACTISE_TO_EARN_TEXT = "Practise a finished lesson to earn hearts.";

/** Visible text of the "Start here" button on a locked level header (GAM-011 AC8). */
export const START_HERE_TEXT = "Start here";
/** Toast when saving the start level failed (GAM-011 AC10). */
export const START_LEVEL_ERROR_TEXT = "We couldn't change your start level. Try again.";

/**
 * "A2 Elementary" from a level whose title is "A2 · Elementary": the code, then the title
 * without a leading code and separator. Just the code when the title adds nothing.
 */
export function levelLabel(level: Pick<CourseLevel, "level" | "title">): string {
  const rest = level.title.startsWith(level.level)
    ? level.title.slice(level.level.length).replace(/^[\s·:\-–—]+/u, "")
    : level.title;
  return rest.trim() === "" ? level.level : `${level.level} ${rest.trim()}`;
}

/** Accessible name of "Start here": "Start here: A2 Elementary" (GAM-011 AC8). */
export function startHereName(level: Pick<CourseLevel, "level" | "title">): string {
  return `${START_HERE_TEXT}: ${levelLabel(level)}`;
}

/** Polite announcement after "Start here": "Starting at A2 Elementary." (GAM-011 AC9). */
export function startingAtText(level: Pick<CourseLevel, "level" | "title">): string {
  return `Starting at ${levelLabel(level)}.`;
}
export const OUT_OF_HEARTS_TITLE = "You're out of hearts";
/** Used only when the caller has no refill time to show (hearts always refill, PD-003). */
export const OUT_OF_HEARTS_FALLBACK = "Your hearts refill over time.";
export const OK_TEXT = "OK";
export const LOADING_TEXT = "Loading your path";
export const COURSE_ERROR_TEXT = "We couldn't load the course.";
export const RETRY_TEXT = "Try again";
export const EMPTY_UNIT_TEXT = "New lessons are on the way.";
