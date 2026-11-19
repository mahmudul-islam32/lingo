/**
 * Course chip of the Learn top bar (GAM-012 AC1, screen 2): the learning language's code,
 * "DE" for `en-de`. Pure. Course ids are `<known>-<learning>` (PD-030, ADR-008), so the
 * code is the part after the last "-"; an id without one shows its first two letters.
 */
import type { Slug } from "@/contracts";

export interface CourseChip {
  /** Visible code, upper case: "DE". */
  code: string;
  /** Screen-reader text: "Course: German" (or "Course: DE" when the language is unknown). */
  label: string;
}

/** Learning-language tag of a course id: `en-de` → `de`. */
export function courseLanguageOf(courseId: Slug): string {
  const dash = courseId.lastIndexOf("-");
  return (dash === -1 ? courseId.slice(0, 2) : courseId.slice(dash + 1)).toLowerCase();
}

/** English name of a language tag ("de" → "German"), or `null` if the runtime can't name it. */
export function languageName(tag: string): string | null {
  try {
    const name = new Intl.DisplayNames(["en"], { type: "language", fallback: "none" }).of(tag);
    return name ?? null;
  } catch {
    return null;
  }
}

export function courseChip(courseId: Slug): CourseChip {
  const tag = courseLanguageOf(courseId);
  const code = tag.toUpperCase();
  return { code, label: `Course: ${languageName(tag) ?? code}` };
}
