import type { ExerciseType } from "@/contracts";

/**
 * Uppercase eyebrow label above each exercise prompt (design v2 "NEW WORD" style, LES-021).
 * Names the exercise type; plain English UI text (never content), so it needs no `lang`.
 */
export const EXERCISE_EYEBROWS: Record<ExerciseType, string> = {
  multiple_choice: "Multiple choice",
  word_bank_translate: "Build the sentence",
  match_pairs: "Match pairs",
  listen: "Listening",
  speak: "Speaking",
  cloze: "Fill the gap",
};
