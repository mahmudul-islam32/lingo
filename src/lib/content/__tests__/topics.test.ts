import { describe, expect, it } from "vitest";
import { ContentValidationError } from "../errors";
import {
  GERMAN_FIXTURE_TOPICS,
  createGermanTopicsFixtureRepository,
} from "../__fixtures__/german-topics-fixture";
import { createGermanFixtureRepository } from "../__fixtures__/german-fixture-course";
import { GERMAN_FIXTURE_COURSE_ID } from "../__fixtures__/german-fixture-course";
import { queryKeys } from "../../query/keys";

/** CTO-023 criterion 4–5 (ADR-021): `getTopics` and the topics fixture. */
describe("ContentRepository.getTopics", () => {
  it("returns the topics of a course in file order", async () => {
    const topics = await createGermanTopicsFixtureRepository().getTopics(GERMAN_FIXTURE_COURSE_ID);
    expect(topics).toEqual(GERMAN_FIXTURE_TOPICS.topics);
    expect(topics.map((t) => t.id)).toEqual(["meeting-people", "food-and-shopping"]);
  });

  it("returns [] for a course without a topics file", async () => {
    expect(await createGermanFixtureRepository().getTopics(GERMAN_FIXTURE_COURSE_ID)).toEqual([]);
    expect(
      await createGermanTopicsFixtureRepository(null).getTopics(GERMAN_FIXTURE_COURSE_ID),
    ).toEqual([]);
  });

  it("throws a ContentValidationError naming the topic and a wrong lesson id", async () => {
    const wrong = {
      ...GERMAN_FIXTURE_TOPICS,
      topics: [
        {
          ...GERMAN_FIXTURE_TOPICS.topics[0]!,
          lessonIds: ["de-a1-u01-l1-hallo", "de-a1-u01-l2-wie-geht-s", "de-a9-nope"],
        },
      ],
    };
    const error = await createGermanTopicsFixtureRepository(wrong)
      .getTopics(GERMAN_FIXTURE_COURSE_ID)
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ContentValidationError);
    expect(String((error as Error).message)).toContain(
      'topic "meeting-people": lesson "de-a9-nope"',
    );
  });

  it("throws for a file that doesn't match the schema", async () => {
    const error = await createGermanTopicsFixtureRepository({
      courseId: "en-de",
      topics: [{ id: "x" }],
    })
      .getTopics(GERMAN_FIXTURE_COURSE_ID)
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ContentValidationError);
  });

  it("has a query key", () => {
    expect(queryKeys.topics("en-de")).toEqual(["topics", "en-de"]);
  });
});

describe("German topics fixture (criterion 5)", () => {
  it("has 2 topics, one with lessons from A1 and A2", async () => {
    const repo = createGermanTopicsFixtureRepository();
    const course = await repo.getCourse(GERMAN_FIXTURE_COURSE_ID);
    const levelOf = new Map(
      course.units.flatMap((u) => u.lessons.map((l) => [l.id, u.level] as const)),
    );
    const levels = GERMAN_FIXTURE_TOPICS.topics.map(
      (t) => new Set(t.lessonIds.map((id) => levelOf.get(id))),
    );
    expect(levels).toHaveLength(2);
    expect(levels.some((s) => s.has("A1") && s.has("A2"))).toBe(true);
  });
});
