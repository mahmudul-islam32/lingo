"use client";

import type { ExerciseComponentProps } from "../types";
import { WordBank } from "../word-bank/WordBank";

export type WordBankTranslateExerciseProps = ExerciseComponentProps<"word_bank_translate"> & {
  /** Random source for the tile shuffle (tests only; not part of the shared props). */
  random?: () => number;
};

/**
 * LES-005: translate the prompt by tapping word tiles. Works in both directions:
 * `to_learning` = prompt in the known language, tiles in the learning language;
 * `to_known` = the reverse.
 */
export function WordBankTranslateExercise({
  exercise,
  learningLanguage,
  knownLanguage,
  headingId,
  disabled,
  onAnswerChange,
  random,
}: WordBankTranslateExerciseProps) {
  const toLearning = exercise.direction === "to_learning";
  const promptLang = toLearning ? knownLanguage : learningLanguage;
  const tileLang = toLearning ? learningLanguage : knownLanguage;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <h2 id={headingId} tabIndex={-1} className="flex flex-col gap-3 outline-none">
        <span className="text-xl font-bold text-fg">Translate this sentence</span>
        <span lang={promptLang} className="text-lg font-semibold break-words text-fg-muted">
          {exercise.prompt}
        </span>
      </h2>
      <WordBank
        tiles={exercise.tiles}
        tileLang={tileLang}
        disabled={disabled}
        random={random}
        onChange={(tiles) =>
          onAnswerChange(tiles.length ? { type: "word_bank_translate", tiles } : null)
        }
      />
    </div>
  );
}
