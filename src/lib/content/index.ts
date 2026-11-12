/**
 * Public API of the content data layer (PLT-007): bundled, schema-validated course
 * content behind the contracts `ContentRepository`. Works offline.
 *
 * Server components (build time) import `@/lib/content/static-params` instead.
 */
export {
  BUNDLED_CONTENT,
  COURSE_REGISTRY,
  type ContentLoaders,
  type CourseRegistryEntry,
  type CourseVisibility,
  type JsonLoader,
} from "./bundled-content";
export { DEFAULT_COURSE_ID, lessonPath } from "./constants";
export {
  contentRepository,
  createContentRepository,
  findLesson,
  firstLesson,
  firstLessonPath,
  getFirstLessonPath,
  listAvailableCourses,
  listBundledCourses,
  parseCourse,
  type BundledContentRepository,
  type LessonLocation,
} from "./content-repository";
export {
  ContentError,
  ContentNotFoundError,
  ContentValidationError,
  type ContentErrorCode,
} from "./errors";
export {
  ContentRepositoryProvider,
  courseQueryOptions,
  lessonQueryOptions,
  useContentRepository,
  useCourse,
  useLesson,
} from "./hooks";
