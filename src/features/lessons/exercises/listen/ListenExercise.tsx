"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { Button } from "@/components/ui";
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

/** "0.75×" from the constant, never a literal (LES-007 notes). */
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
      <h2 id={headingId} tabIndex={-1} className="text-xl font-bold text-fg outline-none">
        Tap what you hear
      </h2>

      {unavailable ? (
        <div
          role="status"
          className="flex flex-col items-start gap-3 rounded-card border-2 border-border bg-surface p-4"
        >
          <p className="font-semibold text-fg">Audio isn&apos;t available right now.</p>
          <Button variant="primary" size="lg" onClick={() => onSkip("audio_unavailable")}>
            Skip
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            aria-label="Play audio"
            loading={status === "loading"}
            disabled={disabled}
            onClick={() => play("normal")}
            className="size-20 rounded-card px-0"
          >
            <SpeakerIcon />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            aria-label="Play slowly"
            disabled={disabled}
            onClick={() => play("slow")}
            className="min-w-12"
          >
            <span>Slow</span>
            <span
              aria-hidden="true"
              className="ml-1 rounded-full bg-surface px-1.5 text-xs font-bold text-fg-muted"
            >
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

/** Speaker glyph (original, decorative; the button carries the label). */
function SpeakerIcon() {
  return (
    <svg
      width={36}
      height={36}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      <path d="M15.5 9a4 4 0 0 1 0 6" />
      <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
    </svg>
  );
}
