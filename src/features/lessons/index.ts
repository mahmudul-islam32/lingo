/** Public API of the lessons feature. Other features import only from here. */
export { checkAnswer, isMatchPairsComplete, joinTiles, matchesAcceptedAnswer } from "./checking";
export type {
  ExerciseComponentMap,
  ExerciseComponentProps,
  ExerciseSkipReason,
} from "./exercises/types";
export { exerciseComponents } from "./exercises/registry";
export {
  buildLessonResult,
  LessonPlayer,
  LessonPlayerError,
  LessonPlayerSkeleton,
  lessonAccuracy,
  summarizeSession,
  type BuildLessonResultInput,
  type LessonPlayerErrorProps,
  type LessonPlayerHearts,
  type LessonPlayerProps,
  type LessonSessionSummary,
} from "./player";
export {
  FeedbackPanel,
  correctAnswerLanguage,
  type FeedbackPanelProps,
} from "./feedback/FeedbackPanel";
export { pickCorrectHeading } from "./feedback/headings";
export {
  MultipleChoiceExercise,
  type MultipleChoiceExerciseProps,
} from "./exercises/multiple-choice/MultipleChoiceExercise";
export {
  MatchPairsExercise,
  type MatchPairsExerciseProps,
} from "./exercises/match-pairs/MatchPairsExercise";
