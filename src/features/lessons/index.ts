/** Public API of the lessons feature. Other features import only from here. */
export { checkAnswer, isMatchPairsComplete, joinTiles, matchesAcceptedAnswer } from "./checking";
export type {
  ExerciseComponentMap,
  ExerciseComponentProps,
  ExerciseSkipReason,
} from "./exercises/types";
export {
  MultipleChoiceExercise,
  type MultipleChoiceExerciseProps,
} from "./exercises/multiple-choice/MultipleChoiceExercise";
export {
  MatchPairsExercise,
  type MatchPairsExerciseProps,
} from "./exercises/match-pairs/MatchPairsExercise";
