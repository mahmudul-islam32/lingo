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
