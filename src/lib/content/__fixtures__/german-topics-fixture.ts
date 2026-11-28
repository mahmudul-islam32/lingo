/**
 * Test-only topics for the German fixture course (CTO-023 criterion 5, ADR-021), for
 * GAM-016's tests. The fixture course has lessons in A1 only, so this fixture adds one A2
 * unit (`de-a2-u01`, 2 lessons) to it; one topic mixes A1 and A2 lessons. Never imported by
 * app code.
 */
import { CourseSchema, CourseTopicsSchema, type Course, type CourseTopics } from "@/contracts";
import type { ContentLoaders } from "../bundled-content";
import { createContentRepository } from "../content-repository";
import {
  GERMAN_FIXTURE_COURSE,
  GERMAN_FIXTURE_COURSE_ID,
  germanFixtureLoaders,
} from "./german-fixture-course";

/** The German fixture course plus an A2 unit with 2 lessons. */
export const GERMAN_TOPICS_FIXTURE_COURSE: Course = CourseSchema.parse({
  ...GERMAN_FIXTURE_COURSE,
  units: [
    ...GERMAN_FIXTURE_COURSE.units,
    {
      id: "de-a2-u01",
      level: "A2",
      title: "Shopping",
      lessons: [
        { id: "de-a2-u01-l1-im-supermarkt", title: "At the Supermarket" },
        { id: "de-a2-u01-l2-was-kostet-das", title: "What Does It Cost?" },
      ],
    },
  ],
});

/** Two topics: one A1 only, one with lessons from A1 and A2. */
export const GERMAN_FIXTURE_TOPICS: CourseTopics = CourseTopicsSchema.parse({
  courseId: GERMAN_FIXTURE_COURSE_ID,
  topics: [
    {
      id: "meeting-people",
      title: "Meeting people",
      description: "Say hello, ask how someone is and be polite.",
      lessonIds: ["de-a1-u01-l1-hallo", "de-a1-u01-l2-wie-geht-s", "de-a1-u02-l2-bitte"],
    },
    {
      id: "food-and-shopping",
      title: "Food and shopping",
      description: "Buy bread, ask for prices and find things in a shop.",
      lessonIds: ["de-a1-u02-l1-brot", "de-a2-u01-l1-im-supermarkt", "de-a2-u01-l2-was-kostet-das"],
    },
  ],
});

/** Loaders for the course above, with its topics file (`topics: null` = no topics file). */
export function germanTopicsFixtureLoaders(
  topics: unknown | null = GERMAN_FIXTURE_TOPICS,
): ContentLoaders {
  const base = germanFixtureLoaders();
  return {
    courses: { [GERMAN_FIXTURE_COURSE_ID]: async () => GERMAN_TOPICS_FIXTURE_COURSE },
    lessons: base.lessons,
    ...(topics === null ? {} : { topics: { [GERMAN_FIXTURE_COURSE_ID]: async () => topics } }),
  };
}

export function createGermanTopicsFixtureRepository(
  topics: unknown | null = GERMAN_FIXTURE_TOPICS,
) {
  return createContentRepository(germanTopicsFixtureLoaders(topics));
}
