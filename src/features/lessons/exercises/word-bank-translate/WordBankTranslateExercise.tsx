"use client";

import { useState } from "react";
import { SpeakerIcon, cn } from "@/components/ui";
import { getDefaultListenAudio } from "../../audio/listen-audio";
import type { SpeechFallback } from "../../audio/speech-fallback";
import { usePromptSpeech } from "../../audio/use-prompt-speech";
import type { ExerciseComponentProps } from "../types";
import { WordBank } from "../word-bank/WordBank";

export type WordBankTranslateExerciseProps = ExerciseComponentProps<"word_bank_translate"> & {
  /** Random source for the tile shuffle (tests only; not part of the shared props). */
  random?: () => number;
  /** Speech synthesis for the prompt speaker (tests inject a fake). Not a shared prop. */
  speech?: SpeechFallback;
};

/** Accessible name of the prompt speaker button. */
export const PROMPT_SPEAKER_LABEL = "Listen to the sentence";

/**
 * LES-005: translate the prompt by tapping word tiles. Works in both directions:
 * `to_learning` = prompt in the known language, tiles in the learning language;
 * `to_known` = the reverse.
 *
 * Design v2 (LES-021, screen 4): the prompt sits in a speech bubble with a round indigo
 * speaker on its left that reads it aloud (only when the device has a voice for it).
 * The heading keeps instruction + prompt as its name; the speaker is placed beside the
 * bubble with a CSS subgrid so it stays outside the heading.
 */
export function WordBankTranslateExercise({
  exercise,
  learningLanguage,
  knownLanguage,
  headingId,
  disabled,
  onAnswerChange,
  random,
  speech: injectedSpeech,
}: WordBankTranslateExerciseProps) {
  const toLearning = exercise.direction === "to_learning";
  const promptLang = toLearning ? knownLanguage : learningLanguage;
  const tileLang = toLearning ? learningLanguage : knownLanguage;
  const [speech] = useState(() => injectedSpeech ?? getDefaultListenAudio().speech);
  const speaker = usePromptSpeech(exercise.prompt, promptLang, speech);

  return (
    <div className="flex w-full min-w-0 flex-col gap-7">
      <div
        className={cn(
          "grid min-w-0 gap-x-3.5 gap-y-4",
          speaker.available ? "grid-cols-[auto_minmax(0,1fr)]" : "grid-cols-1",
        )}
      >
        <h2
          id={headingId}
          tabIndex={-1}
          className={cn(
            "grid min-w-0 grid-cols-subgrid grid-rows-subgrid gap-y-4 outline-none",
            speaker.available ? "col-span-2 row-span-2" : "row-span-2",
          )}
        >
          <span
            className={cn(
              "font-display text-[1.625rem] leading-tight font-bold text-fg",
              speaker.available && "col-span-2",
            )}
          >
            Translate this sentence
          </span>
          <span
            lang={promptLang}
            data-testid="prompt-bubble"
            className={cn(
              "min-w-0 justify-self-start rounded-[0.25rem_1rem_1rem_1rem] border-2 border-border bg-surface",
              "px-4 py-3 font-body text-[1.0625rem] leading-snug font-normal break-words text-fg hyphens-auto",
              speaker.available && "col-start-2",
            )}
          >
            {exercise.prompt}
          </span>
        </h2>
        {speaker.available && (
          <button
            type="button"
            aria-label={PROMPT_SPEAKER_LABEL}
            title={PROMPT_SPEAKER_LABEL}
            onClick={speaker.speak}
            className={cn(
              "col-start-1 row-start-2 inline-flex size-13 items-center justify-center self-start rounded-control",
              "bg-primary text-on-primary shadow-3d-primary hover:bg-primary-hover",
              "focus-visible:focus-ring active:translate-y-0.5 active:shadow-3d-primary-pressed",
              "motion-safe:transition-[background-color,box-shadow,transform] motion-safe:duration-100",
            )}
          >
            <SpeakerIcon size={24} />
          </button>
        )}
      </div>
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
