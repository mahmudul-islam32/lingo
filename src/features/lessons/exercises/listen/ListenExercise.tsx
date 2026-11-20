"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { Button, Card, Lumi, SpeakerIcon } from "@/components/ui";
import { CONTENT_RULES } from "@/contracts";
import { getDefaultListenAudio, type ListenAudio } from "../../audio/listen-audio";
import { useAudioPlayback } from "../../audio/use-audio-playback";
import type { ExerciseComponentProps } from "../types";
import { WordBank } from "../word-bank/WordBank";

export type ListenExerciseProps = ExerciseComponentProps<"listen"> & {
  /** Audio + speech adapter (tests inject mocks). Not part of the shared props. */
  audio?: ListenAudio;
  /** Random source for the tile shuffle (tests only). */
  random?: () => number;
};

/** "0.7×" from the constant, never a literal (LES-007 notes). */
const SLOW_BADGE = `${CONTENT_RULES.slowPlaybackRate}×`;

/**
 * LES-007: hear a learning-language sentence (normal or slow) and build it with tiles.
 * The sentence itself is never rendered here; the feedback panel shows `answers[0]`.
 */
export function ListenExercise({
  exercise,
  learningLanguage,
  headingId,
  disabled,
  onAnswerChange,
  onSkip,
  audio: injectedAudio,
  random,
}: ListenExerciseProps) {
  // Fixed for the component's lifetime (the player remounts on each presentation).
  const [audio] = useState(() => injectedAudio ?? getDefaultListenAudio());
  const { status, play } = useAudioPlayback({
    clip: exercise.audio,
    transcript: exercise.answers[0] ?? "",
    lang: learningLanguage,
    audio,
  });
  const unavailable = status === "unavailable";

  // No audio at all: the answer can't be checked, so "Check" must stay disabled.
  const clearAnswer = useEffectEvent(() => onAnswerChange(null));
  useEffect(() => {
    if (unavailable) clearAnswer();
  }, [unavailable]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <h2
        id={headingId}
        tabIndex={-1}
        className="font-display text-[1.625rem] leading-tight font-bold text-fg outline-none"
      >
        Tap what you hear
      </h2>

      {unavailable ? (
        <Card role="status" tone="flat" className="flex flex-col items-start gap-3">
          {/* FIX-005: small decorative Lumi ember beside the one-line message. */}
          <div className="flex min-w-0 items-center gap-3">
            <Lumi pose="ember" size="sm" />
            <p className="min-w-0 font-semibold text-fg">Audio isn&apos;t available right now.</p>
          </div>
          <Button variant="primary" size="lg" onClick={() => onSkip("audio_unavailable")}>
            Skip
          </Button>
        </Card>
      ) : (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            aria-label="Play audio"
            loading={status === "loading"}
            disabled={disabled}
            onClick={() => play("normal")}
            className="size-24 rounded-[1.5rem] px-0 shadow-[0_5px_0_var(--color-primary-edge)]"
          >
            <SpeakerIcon size={40} strokeWidth={2} />
          </Button>
          <Button
            variant="soft"
            size="lg"
            // WCAG 2.5.3: the name must contain all visible text ("Slow 0.7×"), badge included.
            aria-label={`Slow ${SLOW_BADGE} speed`}
            disabled={disabled}
            onClick={() => play("slow")}
            className="size-16 min-w-12 self-end rounded-tile px-0 [&>span]:flex [&>span]:flex-col-reverse [&>span]:items-center"
          >
            {/* DOM order "Slow 0.7×" (the name starts with the visible words); shown as
                "0.7×" over a small "Slow" (design v2 screen 5). The space keeps them
                separate words for axe's text check. */}
            <span className="text-xs leading-none font-bold">Slow</span>{" "}
            <span aria-hidden="true" className="text-base leading-tight font-extrabold">
              {SLOW_BADGE}
            </span>
          </Button>
        </div>
      )}

      <WordBank
        tiles={exercise.tiles}
        tileLang={learningLanguage}
        disabled={disabled || unavailable}
        random={random}
        onChange={(tiles) => onAnswerChange(tiles.length ? { type: "listen", tiles } : null)}
      />
    </div>
  );
}
