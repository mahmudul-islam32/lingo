/**
 * `ContentRepository` (contracts `api.ts`) over the bundled course JSON (PLT-007).
 * Every file is parsed with the contract schemas when it is loaded; nothing is trusted.
 * Results are memoised per id (content is immutable for a build); a failed load is
 * forgotten, so "Try again" loads again.
 */
import {
  CourseSchema,
  LessonSchema,
  type ContentRepository,
  type Course,
  type Lesson,
  type LessonSummary,
  type Slug,
  type Unit,
} from "@/contracts";
import type { z } from "zod";
import {
  BUNDLED_CONTENT,
  COURSE_REGISTRY,
  type ContentLoaders,
  type CourseRegistryEntry,
} from "./bundled-content";
import { lessonPath } from "./constants";
import { ContentNotFoundError, ContentValidationError } from "./errors";

export interface BundledContentRepository extends ContentRepository {
  /**
   * Loads and validates lessons ahead of time (e.g. Unit 1 after a visit to Learn), so
   * their chunks are in the browser and service-worker caches before going offline.
   * Never rejects.
   */
  preloadLessons(courseId: Slug, lessonIds: readonly Slug[]): Promise<void>;
}

function own<T>(record: Readonly<Record<string, T>>, key: string): T | undefined {
  return Object.hasOwn(record, key) ? record[key] : undefined;
}

export function formatContentIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.map(String).join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

export const courseFile = (courseId: Slug) => `content/courses/${courseId}/course.json`;
export const lessonFile = (courseId: Slug, lessonId: Slug) =>
  `content/courses/${courseId}/lessons/${lessonId}.json`;

/** Parses a raw course manifest; throws `ContentValidationError` naming the file. */
export function parseCourse(raw: unknown, courseId: Slug): Course {
  const parsed = CourseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ContentValidationError(courseFile(courseId), formatContentIssues(parsed.error));
  }
  if (parsed.data.id !== courseId) {
    throw new ContentValidationError(courseFile(courseId), [
      `id: expected "${courseId}", got "${parsed.data.id}"`,
    ]);
  }
  return parsed.data;
}

/** Where a lesson sits in its course: unit, summary and 1-based number in the unit. */
export interface LessonLocation {
  unit: Unit;
  lesson: LessonSummary;
  number: number;
}

export function findLesson(course: Course, lessonId: Slug): LessonLocation | null {
  for (const unit of course.units) {
    const index = unit.lessons.findIndex((l) => l.id === lessonId);
    if (index >= 0) return { unit, lesson: unit.lessons[index]!, number: index + 1 };
  }
  return null;
}

/** The first lesson of the course (onboarding's "Start learning", PLT-007 criterion 6). */
export function firstLesson(course: Course): LessonSummary {
  return course.units[0]!.lessons[0]!;
}

export function firstLessonPath(course: Course): string {
  return lessonPath(firstLesson(course).id);
}

export function createContentRepository(
  loaders: ContentLoaders = BUNDLED_CONTENT,
): BundledContentRepository {
  const courses = new Map<Slug, Promise<Course>>();
  const lessons = new Map<string, Promise<Lesson>>();

  function memo<T>(cache: Map<string, Promise<T>>, key: string, load: () => Promise<T>) {
    const cached = cache.get(key);
    if (cached) return cached;
    const promise = load();
    cache.set(key, promise);
    promise.catch(() => {
      if (cache.get(key) === promise) cache.delete(key);
    });
    return promise;
  }

  const getCourse = (courseId: Slug): Promise<Course> =>
    memo(courses, courseId, async () => {
      const load = own(loaders.courses, courseId);
      if (!load) throw new ContentNotFoundError("course", courseId);
      return parseCourse(await load(), courseId);
    });

  const getLesson = (courseId: Slug, lessonId: Slug): Promise<Lesson> =>
    memo(lessons, `${courseId}/${lessonId}`, async () => {
      const course = await getCourse(courseId);
      const location = findLesson(course, lessonId);
      const load = own(own(loaders.lessons, courseId) ?? {}, lessonId);
      if (!location || !load) throw new ContentNotFoundError("lesson", lessonId);
      const file = lessonFile(courseId, lessonId);
      const parsed = LessonSchema.safeParse(await load());
      if (!parsed.success)
        throw new ContentValidationError(file, formatContentIssues(parsed.error));
      const lesson = parsed.data;
      const mismatches = [
        lesson.id !== lessonId && `id: expected "${lessonId}", got "${lesson.id}"`,
        lesson.courseId !== courseId &&
          `courseId: expected "${courseId}", got "${lesson.courseId}"`,
        lesson.unitId !== location.unit.id &&
          `unitId: expected "${location.unit.id}", got "${lesson.unitId}"`,
      ].filter((m): m is string => typeof m === "string");
      if (mismatches.length > 0) throw new ContentValidationError(file, mismatches);
      return lesson;
    });

  return {
    getCourse,
    getLesson,
    preloadLessons: async (courseId, lessonIds) => {
      await Promise.allSettled(lessonIds.map((id) => getLesson(courseId, id)));
    },
  };
}

/** The app-wide repository over the bundled content. */
export const contentRepository: BundledContentRepository = createContentRepository();

/** Path of the first lesson of a bundled course (for onboarding, PLT-004/PLT-007). */
export async function getFirstLessonPath(
  courseId: Slug,
  repository: ContentRepository = contentRepository,
): Promise<string> {
  return firstLessonPath(await repository.getCourse(courseId));
}

/**
 * Every bundled course, validated, hidden ones included. Onboarding's course step uses it
 * until PLT-024 switches to `listAvailableCourses`.
 */
export async function listBundledCourses(
  repository: ContentRepository = contentRepository,
  loaders: ContentLoaders = BUNDLED_CONTENT,
): Promise<Course[]> {
  return Promise.all(Object.keys(loaders.courses).map((id) => repository.getCourse(id)));
}

/**
 * The `available` courses of the registry, in registry order, validated: what onboarding
 * offers (PD-030, PLT-024). Hidden courses (en-es) still load with `getCourse`.
 */
export async function listAvailableCourses(
  repository: ContentRepository = contentRepository,
  registry: readonly CourseRegistryEntry[] = COURSE_REGISTRY,
): Promise<Course[]> {
  return Promise.all(
    registry.filter((c) => c.visibility === "available").map((c) => repository.getCourse(c.id)),
  );
}
