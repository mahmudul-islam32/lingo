/**
 * Feedback panel copy (LES-003). Kind and never blaming: no "wrong", "fail" or "bad"
 * (criterion 10, enforced by a unit test over every heading).
 */
export const CORRECT_HEADINGS = ["Nice work!", "That's right!", "Well done!"] as const;
export const INCORRECT_HEADING = "Not quite";
export const ALL_FEEDBACK_HEADINGS: readonly string[] = [...CORRECT_HEADINGS, INCORRECT_HEADING];

/** Picks a correct-state heading; `random` returns a number in `[0, 1)` (injectable for tests). */
export function pickCorrectHeading(random: () => number = Math.random): string {
  const value = random();
  const safe = Number.isFinite(value) ? Math.min(Math.max(value, 0), 0.999999) : 0;
  return CORRECT_HEADINGS[Math.floor(safe * CORRECT_HEADINGS.length)] ?? CORRECT_HEADINGS[0];
}
