import type { ChipTone } from "@/components/ui";
import type { Course, LanguageCode } from "@/contracts";

/** English name of a language code, e.g. `en` → "English" (falls back to the code). */
export function languageName(code: LanguageCode): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Card subtitle, e.g. "for English speakers". */
export function courseSubtitle(course: Course): string {
  return `for ${languageName(course.knownLanguage)} speakers`;
}

/** Course code chip text, e.g. `de` → "DE" (design v2 screen 1). */
export function courseCode(course: Course): string {
  return course.learningLanguage.slice(0, 2).toUpperCase();
}

/** Chip colours per learning language, as in screen 1; others are indigo. */
const COURSE_CHIP_TONES: Partial<Record<string, ChipTone>> = {
  de: "gold",
  es: "coral",
  fr: "indigo",
  ja: "pink",
};

export function courseChipTone(course: Course): ChipTone {
  return COURSE_CHIP_TONES[course.learningLanguage.slice(0, 2)] ?? "indigo";
}
