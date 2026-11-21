/**
 * Answer checking contracts. The checker itself is a pure function implemented in
 * `src/features/lessons/checking/` with the signature `CheckAnswer` from `api.ts`.
 */
import { z } from "zod";
import { NonNegativeIntSchema, SlugSchema } from "./common";
import { CONTENT_RULES, GAME_CONFIG } from "./config";
import { clozeCorrectSentence, ExerciseSchema, type ClozeExercise } from "./course";

/** What the learner submitted, one variant per exercise type (discriminated by `type`). */
export const MultipleChoiceAnswerSchema = z.object({
  type: z.literal("multiple_choice"),
  optionId: SlugSchema,
});

export const WordBankTranslateAnswerSchema = z.object({
  type: z.literal("word_bank_translate"),
  /** Tile texts in the order the learner placed them. */
  tiles: z.array(z.string()).max(32),
});

export const MatchPairsAnswerSchema = z.object({
  type: z.literal("match_pairs"),
  /**
   * Final matches. A match-pairs exercise is correct once all pairs are matched
   * (ADR-002 §6). `learningPairId`/`knownPairId` are the pair ids of each column item.
   */
  matches: z.array(z.object({ learningPairId: SlugSchema, knownPairId: SlugSchema })).max(16),
  /**
   * Mismatched taps during play (CR-001). Any mismatch makes the exercise one mistake,
   * not first-try correct, and costs at most 1 heart (PD-012).
   */
  mismatchCount: NonNegativeIntSchema,
});

export const ListenAnswerSchema = z.object({
  type: z.literal("listen"),
  tiles: z.array(z.string()).max(32),
});

export const SpeakAnswerSchema = z
  .object({
    type: z.literal("speak"),
    /** True when the learner pressed "Can't speak now" or recognition was unavailable. */
    skipped: z.boolean(),
    /** Recognition alternatives, best first. Empty iff skipped. */
    transcripts: z.array(z.string().max(500)).max(10),
  })
  .refine((v) => (v.skipped ? v.transcripts.length === 0 : v.transcripts.length > 0), {
    message: "transcripts must be empty when skipped and non-empty otherwise",
    path: ["transcripts"],
  });

export const ClozeAnswerSchema = z.object({
  type: z.literal("cloze"),
  /** The chosen option id for each gap, `optionIds[i]` for `gaps[i]` (ADR-009). */
  optionIds: z.array(SlugSchema).min(1).max(CONTENT_RULES.clozeMaxGaps),
});

/** `choice` (TELC-001): the chosen option id. */
export const ChoiceAnswerSchema = z.object({
  type: z.literal("choice"),
  optionId: SlugSchema,
});

/** `listening` (TELC-001): the chosen option id. */
export const ListeningAnswerSchema = z.object({
  type: z.literal("listening"),
  optionId: SlugSchema,
});

/** `task` (TELC-001): what the learner wrote; empty for speaking or when they only read. */
export const TaskAnswerSchema = z.object({
  type: z.literal("task"),
  text: z.string().max(CONTENT_RULES.taskAnswerMaxLength),
});

/** `explain` (TELC-001): the card was read. */
export const ExplainAnswerSchema = z.object({
  type: z.literal("explain"),
});

export const AnswerInputSchema = z.discriminatedUnion("type", [
  MultipleChoiceAnswerSchema,
  WordBankTranslateAnswerSchema,
  MatchPairsAnswerSchema,
  ListenAnswerSchema,
  SpeakAnswerSchema,
  ClozeAnswerSchema,
  ChoiceAnswerSchema,
  ListeningAnswerSchema,
  TaskAnswerSchema,
  ExplainAnswerSchema,
]);
export type AnswerInput = z.infer<typeof AnswerInputSchema>;
export type AnswerInputOfType<T extends AnswerInput["type"]> = Extract<AnswerInput, { type: T }>;

/** Input to the answer checker; the answer type must match the exercise type. */
export const AnswerCheckInputSchema = z
  .object({
    exercise: ExerciseSchema,
    answer: AnswerInputSchema,
  })
  .refine((v) => v.exercise.type === v.answer.type, {
    message: "answer.type must equal exercise.type",
    path: ["answer", "type"],
  });
export type AnswerCheckInput = z.infer<typeof AnswerCheckInputSchema>;

export const AnswerOutcomeSchema = z.enum(["correct", "incorrect", "skipped"]);
export type AnswerOutcome = z.infer<typeof AnswerOutcomeSchema>;

/** Output of the answer checker. */
export const AnswerCheckResultSchema = z
  .object({
    exerciseId: SlugSchema,
    outcome: AnswerOutcomeSchema,
    /**
     * Canonical correct answer to show in the feedback panel (e.g. `answers[0]`,
     * the correct option text, the speak phrase). `null` for match pairs.
     */
    correctAnswer: z.string().nullable(),
    /**
     * True when this answer counts as one mistake (PD-012): every `incorrect` outcome,
     * plus a correct match-pairs exercise that had at least one mismatch. Drives
     * `LessonResult.mistakeCount`, `perfect` and first-try accuracy.
     */
    mistake: z.boolean(),
    /**
     * Hearts this answer costs (PD-003, PD-012): 1 for an incorrect non-speak answer,
     * 1 for a match-pairs exercise with any mismatch (never more), else 0.
     */
    heartCost: NonNegativeIntSchema,
    /**
     * Cloze only (ADR-009): 0-based indexes of the gaps that were wrong or not filled,
     * ascending, so feedback can mark them. Empty iff `correct`. Absent for other types.
     */
    wrongGapIndexes: z.array(NonNegativeIntSchema).max(CONTENT_RULES.clozeMaxGaps).optional(),
  })
  .refine((v) => v.outcome === "correct" || v.mistake === (v.outcome === "incorrect"), {
    message: "incorrect answers are always a mistake; skipped answers never are",
    path: ["mistake"],
  })
  .refine((v) => v.mistake || v.heartCost === 0, {
    message: "only mistakes can cost hearts",
    path: ["heartCost"],
  })
  .refine(
    (v) =>
      v.wrongGapIndexes === undefined ||
      (v.wrongGapIndexes.length === 0) === (v.outcome === "correct"),
    { message: "wrongGapIndexes is empty iff the outcome is correct", path: ["wrongGapIndexes"] },
  );
export type AnswerCheckResult = z.infer<typeof AnswerCheckResultSchema>;

/**
 * Checks a cloze answer (ADR-009, PD-012). Pure. `correct` only when every gap has its
 * `correctOptionId`; a missing or extra id makes the answer `incorrect`. Like any other
 * exercise, a wrong check is 1 mistake and costs `GAME_CONFIG.heartsLostPerMistake`.
 * `correctAnswer` is the sentence filled with the correct options. `checkAnswer`
 * (features/lessons/checking) delegates its `cloze` branch here.
 */
export function checkClozeAnswer(
  exercise: ClozeExercise,
  answer: z.infer<typeof ClozeAnswerSchema>,
): AnswerCheckResult {
  const wrongGapIndexes = exercise.gaps.flatMap((gap, index) =>
    answer.optionIds[index] === gap.correctOptionId ? [] : [index],
  );
  const correct = wrongGapIndexes.length === 0 && answer.optionIds.length === exercise.gaps.length;
  if (!correct && wrongGapIndexes.length === 0) {
    // Extra ids beyond the last gap: every gap was right, but the answer is malformed.
    wrongGapIndexes.push(...exercise.gaps.map((_gap, index) => index));
  }
  return {
    exerciseId: exercise.id,
    outcome: correct ? "correct" : "incorrect",
    correctAnswer: clozeCorrectSentence(exercise),
    mistake: !correct,
    heartCost: correct ? 0 : GAME_CONFIG.heartsLostPerMistake,
    wrongGapIndexes,
  };
}
