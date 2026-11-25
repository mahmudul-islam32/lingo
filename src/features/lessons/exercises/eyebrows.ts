import type { Exercise, ExerciseType } from "@/contracts";

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
  choice: "Question",
  listening: "Listening",
  task: "Your turn",
  explain: "Learn",
};

/**
 * Eyebrow for one exercise (TELC-001): a `choice` with a passage is "Reading", a `task`
 * names its skill. Other types use `EXERCISE_EYEBROWS`.
 */
export function exerciseEyebrow(exercise: Exercise): string {
  if (exercise.type === "choice" && exercise.passage) return "Reading";
  if (exercise.type === "task") return exercise.skill === "writing" ? "Writing" : "Speaking";
  return EXERCISE_EYEBROWS[exercise.type];
}
