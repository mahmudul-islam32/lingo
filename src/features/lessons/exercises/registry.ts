/**
 * Exercise component registry (LES-002). Owned by LES-002; each exercise ticket
 * (LES-004..LES-007, LES-011, LES-015) adds its own line below. A missing entry means the type
 * is unsupported: the player leaves those exercises out and doesn't count them.
 */
import { ChoiceExercise } from "./choice/ChoiceExercise";
import { ClozeExercise } from "./cloze/ClozeExercise";
import { ExplainExercise } from "./explain/ExplainExercise";
import { ListeningExercise } from "./listening/ListeningExercise";
import { ListenExercise } from "./listen/ListenExercise";
import { MatchPairsExercise } from "./match-pairs/MatchPairsExercise";
import { MultipleChoiceExercise } from "./multiple-choice/MultipleChoiceExercise";
import { TaskExercise } from "./task/TaskExercise";
import type { ExerciseComponentMap } from "./types";
import { WordBankTranslateExercise } from "./word-bank-translate/WordBankTranslateExercise";

export const exerciseComponents: ExerciseComponentMap = {
  multiple_choice: MultipleChoiceExercise, // LES-004
  word_bank_translate: WordBankTranslateExercise, // LES-005
  match_pairs: MatchPairsExercise, // LES-006
  listen: ListenExercise, // LES-007
  // speak: SpeakExercise, (LES-011)
  cloze: ClozeExercise, // LES-015
  choice: ChoiceExercise, // TELC-001
  listening: ListeningExercise, // TELC-001
  task: TaskExercise, // TELC-001
  explain: ExplainExercise, // TELC-001
};
