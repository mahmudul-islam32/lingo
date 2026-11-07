/**
 * The course content shipped with the app (ARCHITECTURE §9). The manifest is a static
 * import; each lesson is a separate dynamic `import()`, so the bundler emits one chunk
 * per lesson that the service worker can precache.
 *
 * Adding a lesson to `content/courses/<courseId>/course.json` needs one line here: the
 * test `bundled-content.test.ts` fails until the map matches the manifest and the files.
 */
import enEsCourse from "../../../content/courses/en-es/course.json";

export type JsonLoader = () => Promise<unknown>;

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
    "en-es": async () => enEsCourse,
  },
  lessons: {
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
  "en-es": enEsCourse,
};
