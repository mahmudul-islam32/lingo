/**
 * Topics (CTO-023, ADR-021, PD-071 #5, PD-086): named groups of existing lessons of ONE
 * course ("At the doctor's", "Finding a flat"). Course data in
 * `content/courses/<courseId>/topics.json`, separate from `course.json` so editing a topic
 * doesn't bump `course.version`. A topic adds no content and never changes the path order,
 * locks or XP. Bundled and precached like lessons; never stored on a server or synced.
 */
import { z } from "zod";
import { SlugSchema, type Slug } from "./common";
import { CONTENT_RULES } from "./config";
import type { Course } from "./course";

const findDuplicates = (ids: readonly string[]) => [
  ...new Set(ids.filter((id, i) => ids.indexOf(id) !== i)),
];

/** One topic: an ordered list of lessons of its course. */
export const TopicSchema = z
  .strictObject({
    id: SlugSchema,
    /** English title, one line at 375 px. */
    title: z.string().trim().min(1).max(CONTENT_RULES.topicTitleMaxLength),
    /** One sentence, at most two lines at 375 px. */
    description: z.string().trim().min(1).max(CONTENT_RULES.topicDescriptionMaxLength),
    /** Lessons of the same course, in the order the topic shows them. */
    lessonIds: z
      .array(SlugSchema)
      .min(CONTENT_RULES.topicMinLessons)
      .max(CONTENT_RULES.topicMaxLessons),
  })
  .superRefine((topic, ctx) => {
    for (const id of findDuplicates(topic.lessonIds)) {
      ctx.addIssue({
        code: "custom",
        message: `topic "${topic.id}" lists lesson "${id}" twice`,
        path: ["lessonIds"],
      });
    }
  });
export type Topic = z.infer<typeof TopicSchema>;

/** The file `content/courses/<courseId>/topics.json`. */
export const CourseTopicsSchema = z
  .strictObject({
    courseId: SlugSchema,
    topics: z.array(TopicSchema).max(CONTENT_RULES.courseMaxTopics),
  })
  .superRefine((file, ctx) => {
    for (const id of findDuplicates(file.topics.map((t) => t.id))) {
      ctx.addIssue({ code: "custom", message: `duplicate topic id "${id}"`, path: ["topics"] });
    }
  });
export type CourseTopics = z.infer<typeof CourseTopicsSchema>;

/**
 * Cross-file rules (CTO-023 criterion 3) that need the course manifest: the file belongs
 * to `course`, every lesson id is a lesson of that course, and a lesson is in at most
 * `CONTENT_RULES.lessonMaxTopics` topics. Returns one message per problem, naming the
 * topic and the id; `[]` when valid. Used by the content test and the content loader.
 */
export function courseTopicsIssues(course: Course, file: CourseTopics): string[] {
  const issues: string[] = [];
  if (file.courseId !== course.id) {
    issues.push(`topics.json courseId "${file.courseId}" is not the course "${course.id}"`);
  }
  const lessons = new Set<Slug>(course.units.flatMap((u) => u.lessons.map((l) => l.id)));
  const uses = new Map<Slug, string[]>();
  for (const topic of file.topics) {
    for (const id of topic.lessonIds) {
      if (!lessons.has(id)) {
        issues.push(`topic "${topic.id}": lesson "${id}" is not in course "${course.id}"`);
      }
      uses.set(id, [...(uses.get(id) ?? []), topic.id]);
    }
  }
  for (const [id, topics] of uses) {
    if (topics.length > CONTENT_RULES.lessonMaxTopics) {
      issues.push(
        `lesson "${id}" is in ${topics.length} topics (${topics.join(", ")}); at most ${CONTENT_RULES.lessonMaxTopics}`,
      );
    }
  }
  return issues;
}
