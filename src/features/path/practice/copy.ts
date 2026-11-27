/** Learner-facing text of the Practice tab (GAM-012 AC6–AC9, PD-065). */
export const PRACTICE_TITLE = "Practice";
export const PRACTICE_INTRO_TEXT =
  "Practise a finished lesson. It's free, and correct answers earn hearts.";
export const PRACTICE_EMPTY_TEXT = "Finish your first lesson to practise it here.";
export const GO_TO_LEARN_TEXT = "Go to Learn";
export const PRACTISE_ACTION_TEXT = "Practise";
export const PRACTICE_LOADING_TEXT = "Loading your finished lessons";
export const PRACTICE_ERROR_TEXT = "We couldn't load your finished lessons.";
export const PRACTICE_RETRY_TEXT = "Try again";

/** Accessible name of a row's action: starts with the visible "Practise" (WCAG 2.5.3). */
export function practiseLessonName(title: string): string {
  return `${PRACTISE_ACTION_TEXT} ${title}`;
}

/** Secondary line of a row: "Unit 2 · Lesson 3". */
export function practiceLessonMeta(unitNumber: number, lessonNumber: number): string {
  return `Unit ${unitNumber} · Lesson ${lessonNumber}`;
}

/** Smart review card (GAM-015 AC10, AC12; PRD §8.3 tone: "ready for review"). */
export const REVIEW_CARD_TITLE = "Review";
export const REVIEW_HREF = "/review";
export const REVIEW_NO_HISTORY_TEXT =
  "Answer exercises in any lesson and they come back here for review.";
export const REVIEW_CAUGHT_UP_TEXT = "You're all caught up. Review anyway to keep them fresh.";
export const REVIEW_START_TEXT = "Start review";
export const REVIEW_ANYWAY_TEXT = "Review anyway";
export const REVIEW_LOADING_TEXT = "Loading your review";
/** Words the card never uses (AC12), matched as whole words, case insensitive. */
export const REVIEW_BANNED_WORDS = ["exam", "test", "pass", "failed", "weak", "behind"] as const;

/** "3 exercises are ready for review." / "1 exercise is ready for review." */
export function reviewDueText(dueCount: number): string {
  return dueCount === 1
    ? "1 exercise is ready for review."
    : `${dueCount} exercises are ready for review.`;
}
