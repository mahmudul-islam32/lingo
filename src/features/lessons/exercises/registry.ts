/**
 * Exercise component registry (LES-002). Owned by LES-002; each exercise ticket
 * (LES-004..LES-007, LES-011) adds its own line below. A missing entry means the type
 * is unsupported: the player leaves those exercises out and doesn't count them.
 */
import { MatchPairsExercise } from "./match-pairs/MatchPairsExercise";
import { MultipleChoiceExercise } from "./multiple-choice/MultipleChoiceExercise";
import type { ExerciseComponentMap } from "./types";

export const exerciseComponents: ExerciseComponentMap = {
  multiple_choice: MultipleChoiceExercise, // LES-004
  // word_bank_translate: WordBankTranslateExercise, (LES-005)
  match_pairs: MatchPairsExercise, // LES-006
  // listen: ListenExercise,                      (LES-007)
};
