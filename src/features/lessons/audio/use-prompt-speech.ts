"use client";

import { useCallback, useEffect, useState } from "react";
import { speechLocale, type LanguageCode } from "@/contracts";
import type { SpeechFallback } from "./speech-fallback";

export interface PromptSpeech {
  /** True once a voice of `lang` was found: only then is a speaker button shown. */
  available: boolean;
  /** Reads the text at normal speed (restarts if already speaking). */
  speak: () => void;
}

/**
 * Reads a word-bank prompt aloud with speech synthesis (LES-021, design v2 screen 4).
 * Word-bank exercises have no audio file, so the speaker is an extra: it only appears
 * when the device has a voice of the prompt's language, and is simply absent otherwise
 * (no error state, the exercise works the same without it).
 */
export function usePromptSpeech(
  text: string,
  lang: LanguageCode,
  speech: SpeechFallback,
): PromptSpeech {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    let active = true;
    void speech.findVoice(speechLocale(lang)).then((found) => {
      if (active) setVoice(found);
    });
    return () => {
      active = false;
      speech.cancel();
    };
  }, [speech, lang]);

  const speak = useCallback(() => {
    if (voice) speech.speak(text, { voice, rate: 1 });
  }, [speech, text, voice]);

  return { available: voice !== null, speak };
}
