/**
 * Answer checking (LES-001, PD-010, PD-012).
 *
 * Pure: no React, DOM, storage or clock. Text rules come from the contracts
 * (`normalizeAnswerText`, `foldDiacritics`) so the checker and the content schema
 * ("answer is buildable from the tiles") can never drift apart.
 *
 * - Case, surrounding/repeated whitespace and punctuation are ignored.
 * - Accents and `ñ` are significant for tile answers ("si" ≠ "sí", "ano" ≠ "año").
 * - Apostrophes are kept ("I'm" ≠ "Im"); curly apostrophes equal straight ones.
 * - Any accepted answer counts; `answers[0]` is the canonical one shown on feedback.
 * - Speak transcripts are compared diacritic-insensitively and never cost hearts.
 */
import {
  foldDiacritics,
  GAME_CONFIG,
  normalizeAnswerText,
  type AnswerCheckInput,
  type AnswerCheckResult,
  type AnswerInputOfType,
  type CheckAnswer,
  type ExerciseOfType,
} from "@/contracts";

type Outcome = AnswerCheckResult["outcome"];

function result(
  exerciseId: string,
  outcome: Outcome,
  correctAnswer: string | null,
  costsHeart: boolean,
): AnswerCheckResult {
  return {
    exerciseId,
    outcome,
    correctAnswer,
    heartCost: outcome === "incorrect" && costsHeart ? GAME_CONFIG.heartsLostPerMistake : 0,
  };
}

/** Compile-time exhaustiveness guard: adding an exercise type without a branch fails the build. */
function assertNever(value: never): never {
  throw new Error(`Unhandled exercise type: ${JSON.stringify(value)}`);
}

/** True when the learner's text matches any accepted answer under PD-010 rules. */
export function matchesAcceptedAnswer(given: string, accepted: readonly string[]): boolean {
  const normalized = normalizeAnswerText(given);
  if (normalized === "") return false;
  return accepted.some((answer) => normalizeAnswerText(answer) === normalized);
}

/** Joins tiles in the order the learner placed them into one sentence. */
export function joinTiles(tiles: readonly string[]): string {
  return tiles.join(" ");
}

function checkMultipleChoice(
  exercise: ExerciseOfType<"multiple_choice">,
  answer: AnswerInputOfType<"multiple_choice">,
): AnswerCheckResult {
  const correctOption = exercise.options.find((o) => o.id === exercise.correctOptionId);
  const correct = answer.optionId === exercise.correctOptionId;
  return result(exercise.id, correct ? "correct" : "incorrect", correctOption?.text ?? null, true);
}

function checkTiles(
  exercise: ExerciseOfType<"word_bank_translate" | "listen">,
  answer: AnswerInputOfType<"word_bank_translate" | "listen">,
): AnswerCheckResult {
  const correct = matchesAcceptedAnswer(joinTiles(answer.tiles), exercise.answers);
  return result(exercise.id, correct ? "correct" : "incorrect", exercise.answers[0] ?? null, true);
}

/**
 * Correct when every pair of the exercise is matched exactly once with itself and
 * nothing else is submitted. Mismatched taps are live feedback and are not part of the
 * answer (ADR-002 §6); see `checkMatchPairsWithMismatches` for PD-012 accuracy.
 */
export function isMatchPairsComplete(
  exercise: ExerciseOfType<"match_pairs">,
  answer: AnswerInputOfType<"match_pairs">,
): boolean {
  const pairIds = new Set(exercise.pairs.map((p) => p.id));
  if (answer.matches.length !== pairIds.size) return false;
  const seen = new Set<string>();
  for (const match of answer.matches) {
    if (match.learningPairId !== match.knownPairId) return false;
    if (!pairIds.has(match.learningPairId) || seen.has(match.learningPairId)) return false;
    seen.add(match.learningPairId);
  }
  return true;
}

function checkMatchPairs(
  exercise: ExerciseOfType<"match_pairs">,
  answer: AnswerInputOfType<"match_pairs">,
): AnswerCheckResult {
  const correct = isMatchPairsComplete(exercise, answer);
  return result(exercise.id, correct ? "correct" : "incorrect", null, true);
}

function checkSpeak(
  exercise: ExerciseOfType<"speak">,
  answer: AnswerInputOfType<"speak">,
): AnswerCheckResult {
  if (answer.skipped) return result(exercise.id, "skipped", exercise.phrase, false);
  const accepted = new Set(
    [exercise.phrase, ...(exercise.acceptedTranscripts ?? [])].map(foldDiacritics),
  );
  const correct = answer.transcripts.some((t) => {
    const folded = foldDiacritics(t);
    return folded !== "" && accepted.has(folded);
  });
  return result(exercise.id, correct ? "correct" : "incorrect", exercise.phrase, false);
}

function typeMismatch(input: AnswerCheckInput): never {
  throw new TypeError(
    `checkAnswer: answer type "${input.answer.type}" does not match exercise type "${input.exercise.type}"`,
  );
}

/** Implements the `CheckAnswer` contract (`src/contracts/api.ts`). */
export const checkAnswer: CheckAnswer = (input) => {
  const { exercise, answer } = input;
  switch (exercise.type) {
    case "multiple_choice":
      return answer.type === "multiple_choice"
        ? checkMultipleChoice(exercise, answer)
        : typeMismatch(input);
    case "word_bank_translate":
      return answer.type === "word_bank_translate"
        ? checkTiles(exercise, answer)
        : typeMismatch(input);
    case "listen":
      return answer.type === "listen" ? checkTiles(exercise, answer) : typeMismatch(input);
    case "match_pairs":
      return answer.type === "match_pairs"
        ? checkMatchPairs(exercise, answer)
        : typeMismatch(input);
    case "speak":
      return answer.type === "speak" ? checkSpeak(exercise, answer) : typeMismatch(input);
    default:
      return assertNever(exercise);
  }
};

/** Match-pairs check plus whether any mismatch happened during play (PD-012). */
export interface MatchPairsCheck {
  result: AnswerCheckResult;
  /** At least one mismatched tap: the exercise is not first-try correct and counts 1 mistake. */
  hadMismatch: boolean;
}

/**
 * Workaround for CR-001 (docs/architecture/contract-requests.md): the contract answer
 * does not carry the mismatch count yet, so the player passes the count it tracked
 * during play. Remove once `MatchPairsAnswer.mistakeCount` exists.
 */
export function checkMatchPairsWithMismatches(input: {
  exercise: ExerciseOfType<"match_pairs">;
  answer: AnswerInputOfType<"match_pairs">;
  mismatchCount: number;
}): MatchPairsCheck {
  return {
    result: checkAnswer({ exercise: input.exercise, answer: input.answer }),
    hadMismatch: input.mismatchCount > 0,
  };
}
