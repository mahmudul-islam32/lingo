import { describe, expect, it } from "vitest";
import { CONTENT_RULES, CourseTopicsSchema, TopicSchema, courseTopicsIssues } from "../index";
import { course } from "./fixtures";

/** CTO-023 (ADR-021): topic schema and the cross-file rules. */
const topic = {
  id: "greetings",
  title: "Greetings",
  description: "Say hello and introduce yourself.",
  lessonIds: ["greetings-1", "introductions-1", "greetings-1-extra"],
};

describe("TopicSchema", () => {
  it("accepts a topic", () => {
    expect(TopicSchema.parse(topic)).toEqual(topic);
  });

  it.each([
    ["a non-slug id", { id: "Greetings!" }],
    ["an empty title", { title: " " }],
    ["a title over 30 characters", { title: "x".repeat(CONTENT_RULES.topicTitleMaxLength + 1) }],
    ["a description over 90 characters", { description: "x".repeat(91) }],
    ["fewer than 3 lessons", { lessonIds: ["greetings-1", "introductions-1"] }],
    ["more than 12 lessons", { lessonIds: Array.from({ length: 13 }, (_, i) => `l-${i}`) }],
    ["a duplicate lesson", { lessonIds: ["greetings-1", "greetings-1", "introductions-1"] }],
    ["an unknown key", { icon: "wave" }],
  ])("rejects %s", (_, patch) => {
    expect(TopicSchema.safeParse({ ...topic, ...patch }).success).toBe(false);
  });

  it("names the topic and the duplicate lesson", () => {
    const res = TopicSchema.safeParse({
      ...topic,
      lessonIds: ["greetings-1", "greetings-1", "introductions-1"],
    });
    expect(res.error?.issues.map((i) => i.message)).toContain(
      'topic "greetings" lists lesson "greetings-1" twice',
    );
  });
});

describe("CourseTopicsSchema", () => {
  it("accepts a file and an empty topic list", () => {
    expect(CourseTopicsSchema.safeParse({ courseId: "en-de", topics: [topic] }).success).toBe(true);
    expect(CourseTopicsSchema.safeParse({ courseId: "en-de", topics: [] }).success).toBe(true);
  });

  it("rejects duplicate topic ids, more than 12 topics and unknown keys", () => {
    expect(
      CourseTopicsSchema.safeParse({ courseId: "en-de", topics: [topic, topic] }).success,
    ).toBe(false);
    const many = Array.from({ length: 13 }, (_, i) => ({ ...topic, id: `t-${i}` }));
    expect(CourseTopicsSchema.safeParse({ courseId: "en-de", topics: many }).success).toBe(false);
    expect(CourseTopicsSchema.safeParse({ courseId: "en-de", topics: [], v: 1 }).success).toBe(
      false,
    );
  });
});

describe("courseTopicsIssues (criterion 3)", () => {
  it("is empty for topics whose lessons are all in the course", () => {
    const file = CourseTopicsSchema.parse({
      courseId: course.id,
      topics: [{ ...topic, lessonIds: ["greetings-1", "introductions-1", "greetings-1-x"] }],
    });
    const withThird = {
      ...course,
      units: [
        {
          ...course.units[0]!,
          lessons: [...course.units[0]!.lessons, { id: "greetings-1-x", title: "More" }],
        },
      ],
    };
    expect(courseTopicsIssues(withThird, file)).toEqual([]);
  });

  it("names the topic and the lesson id that is not in the course", () => {
    const file = CourseTopicsSchema.parse({ courseId: course.id, topics: [topic] });
    expect(courseTopicsIssues(course, file)).toEqual([
      `topic "greetings": lesson "greetings-1-extra" is not in course "${course.id}"`,
    ]);
  });

  it("rejects a file for another course (lessons of another course)", () => {
    const file = CourseTopicsSchema.parse({ courseId: "en-de", topics: [] });
    expect(courseTopicsIssues(course, file)).toEqual([
      `topics.json courseId "en-de" is not the course "${course.id}"`,
    ]);
  });

  it("allows a lesson in 2 topics but not in 3", () => {
    const lessons = ["greetings-1", "introductions-1"];
    const withX = {
      ...course,
      units: [
        { ...course.units[0]!, lessons: [...course.units[0]!.lessons, { id: "x-1", title: "X" }] },
      ],
    };
    const mk = (n: number) =>
      CourseTopicsSchema.parse({
        courseId: course.id,
        topics: Array.from({ length: n }, (_, i) => ({
          ...topic,
          id: `t-${i}`,
          lessonIds: [...lessons, "x-1"],
        })),
      });
    expect(courseTopicsIssues(withX, mk(2))).toEqual([]);
    expect(courseTopicsIssues(withX, mk(3))).toEqual([
      'lesson "greetings-1" is in 3 topics (t-0, t-1, t-2); at most 2',
      'lesson "introductions-1" is in 3 topics (t-0, t-1, t-2); at most 2',
      'lesson "x-1" is in 3 topics (t-0, t-1, t-2); at most 2',
    ]);
  });
});
