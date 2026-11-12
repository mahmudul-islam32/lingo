/**
 * Learning-language helpers (CTO-008, PD-034). Features never hard-code a locale: they
 * derive it from `course.learningLanguage` through these functions.
 */
import type { LanguageCode } from "./common";

/**
 * Default region per base language for speech synthesis and recognition. German content
 * is standard German as used in Germany (PD-032), so `de` speaks and listens as `de-DE`.
 * Languages not listed keep their tag as is (Spanish stays `es`: any `es-*` voice).
 */
export const SPEECH_LOCALES: Readonly<Record<string, LanguageCode>> = {
  de: "de-DE",
};

/**
 * Speech locale for a learning language: a tag with a region is kept (`de-AT` → `de-AT`),
 * a bare tag maps through `SPEECH_LOCALES` (`de` → `de-DE`), anything else is returned
 * unchanged (`es` → `es`). Use it for `SpeechSynthesisUtterance` voice choice and
 * `SpeechRecognition.lang`; voice pickers still fall back to any voice of the base language.
 */
export function speechLocale(lang: LanguageCode): LanguageCode {
  if (lang.includes("-")) return lang;
  return Object.hasOwn(SPEECH_LOCALES, lang) ? SPEECH_LOCALES[lang]! : lang;
}
