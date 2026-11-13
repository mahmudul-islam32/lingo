"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CONTENT_RULES, speechLocale, type AudioClip, type LanguageCode } from "@/contracts";
import type { ListenAudio } from "./listen-audio";

/**
 * - `idle`: ready; nothing playing (also after autoplay was blocked or playback ended).
 * - `loading`: the file (or the fallback voice) is loading.
 * - `playing`: the file is playing.
 * - `fallback`: the file failed; Play/Slow use speech synthesis (PD-007).
 * - `unavailable`: no file and no voice of the learning language: the learner may skip.
 */
export type AudioPlaybackStatus = "idle" | "loading" | "playing" | "fallback" | "unavailable";
export type PlaybackSpeed = "normal" | "slow";

export interface UseAudioPlaybackOptions {
  clip: AudioClip;
  /** Text read by the speech fallback (`answers[0]`). */
  transcript: string;
  /**
   * Learning language (`course.learningLanguage`, e.g. `de`). The speech fallback looks for
   * a voice of `speechLocale(lang)` (`de` → `de-DE`), then any voice of the base language
   * (`de-*`), else reports `unavailable` (PD-007, PD-034).
   */
  lang: LanguageCode;
  audio: ListenAudio;
}

export interface AudioPlayback {
  status: AudioPlaybackStatus;
  /** Plays from the start (restarts if already playing). */
  play: (speed: PlaybackSpeed) => void;
}

/** File and rate for a speed: a dedicated slow file plays at 1×, else the slow constant. */
export function resolvePlayback(clip: AudioClip, speed: PlaybackSpeed) {
  if (speed === "slow") {
    return clip.slowSrc
      ? { src: clip.slowSrc, rate: 1 }
      : { src: clip.src, rate: CONTENT_RULES.slowPlaybackRate };
  }
  return { src: clip.src, rate: 1 };
}

/** Speech-synthesis rate for a speed (same constant as the file's slow rate). */
export function speechRate(speed: PlaybackSpeed): number {
  return speed === "slow" ? CONTENT_RULES.slowPlaybackRate : 1;
}

/**
 * Listen-exercise playback state machine (LES-007). Autoplays once on mount (blocked
 * autoplay stays silent), falls back to speech synthesis when the file fails, and
 * reports `unavailable` when there is no voice either.
 */
export function useAudioPlayback({
  clip,
  transcript,
  lang,
  audio,
}: UseAudioPlaybackOptions): AudioPlayback {
  const { src, slowSrc } = clip;
  // Starts in `loading` because the mount effect immediately tries to autoplay.
  const [status, setStatus] = useState<AudioPlaybackStatus>("loading");
  const requestId = useRef(0);
  const fileFailed = useRef(false);
  const voicePromise = useRef<Promise<SpeechSynthesisVoice | null> | null>(null);

  const speakFallback = useCallback(
    async (speed: PlaybackSpeed, request: number) => {
      fileFailed.current = true;
      if (!voicePromise.current) {
        setStatus("loading");
        voicePromise.current = audio.speech.findVoice(speechLocale(lang));
      }
      const voice = await voicePromise.current;
      if (request !== requestId.current) return;
      if (!voice) {
        setStatus("unavailable");
        return;
      }
      setStatus("fallback");
      audio.speech.speak(transcript, { voice, rate: speechRate(speed) });
    },
    [audio, lang, transcript],
  );

  const playFile = useCallback(
    async (speed: PlaybackSpeed) => {
      const request = ++requestId.current;
      const isCurrent = () => request === requestId.current;
      if (!src) {
        await speakFallback(speed, request);
        return;
      }
      const result = await audio.player.play(resolvePlayback({ src, slowSrc }, speed), {
        onEnded: () => {
          if (isCurrent()) setStatus("idle");
        },
        onError: () => {
          if (isCurrent()) void speakFallback(speed, request);
        },
      });
      if (!isCurrent()) return;
      if (result === "playing") setStatus("playing");
      else if (result === "blocked") setStatus("idle");
      else if (result === "failed") await speakFallback(speed, request);
    },
    [audio, src, slowSrc, speakFallback],
  );

  useEffect(() => {
    void playFile("normal");
    return () => {
      requestId.current += 1;
      audio.player.stop();
      audio.speech.cancel();
    };
  }, [audio, playFile]);

  const play = useCallback(
    (speed: PlaybackSpeed) => {
      if (fileFailed.current) {
        const request = ++requestId.current;
        void speakFallback(speed, request);
        return;
      }
      setStatus("loading");
      void playFile(speed);
    },
    [playFile, speakFallback],
  );

  return { status, play };
}
