"use client";

import { useEffect, useState } from "react";
import { Button, Card, RichText, SpeakerIcon } from "@/components/ui";
import { CONTENT_RULES, speechLocale } from "@/contracts";
import { getDefaultListenAudio } from "../../audio/listen-audio";
import type { SpeechFallback } from "../../audio/speech-fallback";
import type { ExerciseComponentProps } from "../types";
import { OptionList } from "../option-list/OptionList";

export type ListeningExerciseProps = ExerciseComponentProps<"listening"> & {
  /** Speech adapter (tests inject a mock). */
  speech?: SpeechFallback;
};

/** Text to read aloud: speaker labels ("Anna:") are dropped, turns become pauses. */
export function spokenTranscript(transcript: string): string {
  return transcript
    .split("\n")
    .map((line) => line.replace(/^\s*[\p{L} .'-]{1,30}:\s+/u, "").trim())
    .filter(Boolean)
    .join(" … ");
}

/**
 * Listening comprehension (TELC-001): the transcript is read with a voice of the
 * learning language (normal or slow). Without a voice the learner can read the text
 * instead, so the exercise always stays playable. The transcript is shown in feedback.
 */
export function ListeningExercise({
  exercise,
  learningLanguage,
  headingId,
  disabled,
  review,
  onAnswerChange,
  speech: injected,
}: ListeningExerciseProps) {
  const [speech] = useState(() => injected ?? getDefaultListenAudio().speech);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null | undefined>(undefined);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    let active = true;
    void speech.findVoice(speechLocale(learningLanguage)).then((v) => {
      if (active) setVoice(v);
    });
    return () => {
      active = false;
      speech.cancel();
    };
  }, [speech, learningLanguage]);

  const text = spokenTranscript(exercise.transcript);
  const play = (rate: number) => {
    if (voice) speech.speak(text, { voice, rate });
  };
  const noVoice = voice === null;

  return (
    <section className="flex w-full min-w-0 flex-col gap-5">
      {exercise.title && (
        <p lang={learningLanguage} className="font-semibold text-fg-muted">
          {exercise.title}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="primary"
          size="lg"
          aria-label="Play audio"
          loading={voice === undefined}
          disabled={noVoice}
          onClick={() => play(1)}
        >
          <SpeakerIcon size={22} />
          Play
        </Button>
        <Button
          variant="secondary"
          size="lg"
          aria-label="Play audio slowly"
          disabled={noVoice || voice === undefined}
          onClick={() => play(CONTENT_RULES.slowPlaybackRate)}
        >
          Slow
        </Button>
      </div>
      {(noVoice || showText) && !review ? (
        <Card role="status" tone="flat" className="flex flex-col gap-2">
          {noVoice && (
            <p className="font-semibold text-fg-muted">
              Audio isn&apos;t available on this device. Read the text instead:
            </p>
          )}
          <RichText text={exercise.transcript} lang={learningLanguage} className="text-fg" />
        </Card>
      ) : (
        !review &&
        voice && (
          <Button variant="ghost" size="sm" onClick={() => setShowText(true)} disabled={disabled}>
            Show the text
          </Button>
        )
      )}
      <h2
        id={headingId}
        tabIndex={-1}
        lang={learningLanguage}
        className="font-display text-[1.375rem] leading-tight font-bold break-words text-fg focus:outline-none"
      >
        {exercise.prompt}
      </h2>
      <OptionList
        options={exercise.options}
        correctOptionId={exercise.correctOptionId}
        labelledBy={headingId}
        lang={learningLanguage}
        locked={disabled || review !== null}
        review={review}
        onSelect={(optionId) => onAnswerChange({ type: "listening", optionId })}
      />
    </section>
  );
}
