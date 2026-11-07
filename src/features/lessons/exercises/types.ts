import type {
  AnswerCheckResult,
  AnswerInputOfType,
  ExerciseOfType,
  ExerciseType,
  LanguageCode,
} from "@/contracts";

/** Why an exercise could not be played. The player moves on; it is not counted. */
export type ExerciseSkipReason = "audio_unavailable" | "invalid_content";

export interface ExerciseComponentProps<T extends ExerciseType = ExerciseType> {
  /** The exercise to show (already narrowed by `type`). */
  exercise: ExerciseOfType<T>;
  /**
   * Changes every time the exercise is presented (first time and each re-queue).
   * The player also uses it as the React `key`, so each presentation mounts fresh:
   * reshuffle options/tiles and reset local state on mount.
   */
  presentationKey: string;
  /** Course languages, for `lang` attributes and speech synthesis (`es`, `en`). */
  learningLanguage: LanguageCode;
  knownLanguage: LanguageCode;
  /**
   * id for the exercise's prompt heading. Render it on an `<h2 id={headingId} tabIndex={-1}>`;
   * the player moves focus there on each new exercise (criterion 13).
   */
  headingId: string;
  /** True once the answer was checked (or the exercise completed): inputs are locked. */
  disabled: boolean;
  /**
   * Result of "Check", or null before. Lets the component mark correct/incorrect
   * choices (LES-004 criterion 8). Always null for match pairs.
   */
  review: AnswerCheckResult | null;
  /**
   * "Answer ready" + "answer": call with the current answer whenever it changes, or
   * with null when no answer is ready. "Check" is enabled iff the last value is non-null.
   * Not used by self-completing exercises (match pairs).
   */
  onAnswerChange: (answer: AnswerInputOfType<T> | null) => void;
  /** "Skipped": the exercise can't be played; the player moves on without re-queueing. */
  onSkip: (reason: ExerciseSkipReason) => void;
  /**
   * "Complete": only for self-completing exercises (match pairs). Called once, when
   * every pair is matched, with the final answer incl. `mismatchCount` (CR-001). The
   * player runs `checkAnswer` on it; the result's `mistake` drives PD-012 scoring.
   */
  onComplete: (answer: AnswerInputOfType<T>) => void;
}

/** Registry: one component per supported type; a missing entry = unsupported (criterion 9). */
export type ExerciseComponentMap = {
  [T in ExerciseType]?: React.ComponentType<ExerciseComponentProps<T>>;
};
