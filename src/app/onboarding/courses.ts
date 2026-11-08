import { CourseSchema, type Course, type LanguageCode } from "@/contracts";

/** Loads the courses offered at onboarding. Injected in tests. */
export type LoadCourses = () => Promise<Course[]>;

/**
 * Minimal course loader until `src/lib/content` (PLT-007) exists: the bundled course
 * manifests, validated against `CourseSchema`. MVP has one course (en-es). The JSON is
 * a separate chunk loaded on demand, so it is available offline once precached.
 */
export const loadCourses: LoadCourses = async () => {
  const enEs = await import("../../../content/courses/en-es/course.json");
  return [CourseSchema.parse(enEs.default)];
};

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
