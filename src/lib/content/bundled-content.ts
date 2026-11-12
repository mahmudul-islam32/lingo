/**
 * The course content shipped with the app (ARCHITECTURE §9). The manifest is a static
 * import; each lesson is a separate dynamic `import()`, so the bundler emits one chunk
 * per lesson that the service worker can precache.
 *
 * Adding a lesson to `content/courses/<courseId>/course.json` needs one line here: the
 * test `bundled-content.test.ts` fails until the map matches the manifest and the files.
 * Adding a course needs its manifest import plus an entry in each map below (CTO-008).
 * Keep the key order of the maps equal to `COURSE_REGISTRY`.
 *
 * Lesson ids are unique across ALL bundled courses (the route is `/lesson/<lessonId>`);
 * the test enforces it. en-de ids follow PD-037 (`de-a1-u01-l1-…`, ADR-008).
 */
import enDeCourse from "../../../content/courses/en-de/course.json";
import enEsCourse from "../../../content/courses/en-es/course.json";

export type JsonLoader = () => Promise<unknown>;

/**
 * `available` courses are offered in onboarding; `hidden` ones are not shown or named
 * but still load by id, so learners whose settings already say so keep playing (PD-030).
 */
export type CourseVisibility = "available" | "hidden";

export interface CourseRegistryEntry {
  id: string;
  visibility: CourseVisibility;
}

/**
 * The course registry (CTO-008): every bundled course, in display order (default course
 * first). The loader maps below must have exactly these ids (tested).
 */
export const COURSE_REGISTRY: readonly CourseRegistryEntry[] = [
  { id: "en-de", visibility: "available" },
  { id: "en-es", visibility: "hidden" },
];

export interface ContentLoaders {
  /** Course manifests by course id. */
  courses: Readonly<Record<string, JsonLoader>>;
  /** Lesson files by course id, then lesson id. */
  lessons: Readonly<Record<string, Readonly<Record<string, JsonLoader>>>>;
}

const json =
  (load: () => Promise<{ default: unknown }>): JsonLoader =>
  () =>
    load().then((module) => module.default);

export const BUNDLED_CONTENT: ContentLoaders = {
  courses: {
    "en-de": async () => enDeCourse,
    "en-es": async () => enEsCourse,
  },
  lessons: {
    "en-de": {
      "de-a1-u01-l1-hallo": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u01-l1-hallo.json"),
      ),
    },
    "en-es": {
      "u1-l1-hello": json(() => import("../../../content/courses/en-es/lessons/u1-l1-hello.json")),
      "u1-l2-nice-to-meet-you": json(
        () => import("../../../content/courses/en-es/lessons/u1-l2-nice-to-meet-you.json"),
      ),
      "u1-l3-at-the-cafe": json(
        () => import("../../../content/courses/en-es/lessons/u1-l3-at-the-cafe.json"),
      ),
      "u1-l4-count-it": json(
        () => import("../../../content/courses/en-es/lessons/u1-l4-count-it.json"),
      ),
      "u1-l5-around-town": json(
        () => import("../../../content/courses/en-es/lessons/u1-l5-around-town.json"),
      ),
    },
  },
};

/** Raw bundled manifest, for build-time use (`generateStaticParams`). */
export const BUNDLED_COURSE_MANIFESTS: Readonly<Record<string, unknown>> = {
  "en-de": enDeCourse,
  "en-es": enEsCourse,
};
