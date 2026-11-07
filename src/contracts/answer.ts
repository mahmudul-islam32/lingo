/**
 * Answer checking contracts. The checker itself is a pure function implemented in
 * `src/features/lessons/checking/` with the signature `CheckAnswer` from `api.ts`.
 */
import { z } from "zod";
import { NonNegativeIntSchema, SlugSchema } from "./common";
import { ExerciseSchema } from "./course";

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
   * Final matches. Mismatched taps during play get live feedback and are not
   * submitted: a match-pairs exercise is correct once all pairs are matched
   * (ADR-002). `learningPairId`/`knownPairId` are the pair ids of each column item.
   */
  matches: z.array(z.object({ learningPairId: SlugSchema, knownPairId: SlugSchema })).max(16),
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

export const AnswerInputSchema = z.discriminatedUnion("type", [
  MultipleChoiceAnswerSchema,
  WordBankTranslateAnswerSchema,
  MatchPairsAnswerSchema,
  ListenAnswerSchema,
  SpeakAnswerSchema,
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
    /** Hearts this answer costs: 1 for incorrect non-speak answers, else 0 (PD-003). */
    heartCost: NonNegativeIntSchema,
  })
  .refine((v) => v.outcome === "incorrect" || v.heartCost === 0, {
    message: "only incorrect answers can cost hearts",
    path: ["heartCost"],
  });
export type AnswerCheckResult = z.infer<typeof AnswerCheckResultSchema>;
