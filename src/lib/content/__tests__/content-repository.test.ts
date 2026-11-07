// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import {
  ContentNotFoundError,
  ContentValidationError,
  contentRepository,
  createContentRepository,
  DEFAULT_COURSE_ID,
  findLesson,
  firstLessonPath,
  getFirstLessonPath,
  lessonPath,
} from "../index";
import { bundledLessonIds, bundledLessonPaths } from "../static-params";
import {
  createFixtureRepository,
  FIXTURE_COURSE,
  FIXTURE_COURSE_ID,
  FIXTURE_LESSONS,
  fixtureLoaders,
} from "../__fixtures__/fixture-course";

describe("ContentRepository (fixture course)", () => {
  it("loads and validates the course and a lesson", async () => {
    const repo = createFixtureRepository();
    expect(await repo.getCourse(FIXTURE_COURSE_ID)).toEqual(FIXTURE_COURSE);
    expect(await repo.getLesson(FIXTURE_COURSE_ID, "fx-l2")).toEqual(FIXTURE_LESSONS["fx-l2"]);
  });

  it("rejects unknown course and lesson ids with ContentNotFoundError", async () => {
    const repo = createFixtureRepository();
    await expect(repo.getCourse("nope")).rejects.toBeInstanceOf(ContentNotFoundError);
    await expect(repo.getLesson(FIXTURE_COURSE_ID, "nope")).rejects.toMatchObject({
      code: "content_not_found",
      kind: "lesson",
      id: "nope",
    });
    await expect(repo.getLesson(FIXTURE_COURSE_ID, "__proto__")).rejects.toBeInstanceOf(
      ContentNotFoundError,
    );
  });

  it("rejects an invalid course file, naming the file and the field path", async () => {
    const repo = createFixtureRepository({ course: { ...FIXTURE_COURSE, version: 0 } });
    const error = await repo.getCourse(FIXTURE_COURSE_ID).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ContentValidationError);
    expect(error).toMatchObject({ file: "content/courses/fx-es/course.json" });
    expect((error as ContentValidationError).issues.join("\n")).toMatch(/^version: /m);
  });

  it("rejects an invalid lesson file, naming the file and the field path", async () => {
    const broken = structuredClone(FIXTURE_LESSONS["fx-l1"]!) as Record<string, unknown>;
    (broken.exercises as Record<string, unknown>[])[0]!.correctOptionId = "z";
    const repo = createFixtureRepository({ lessons: { "fx-l1": broken } });
    const error = (await repo
      .getLesson(FIXTURE_COURSE_ID, "fx-l1")
      .catch((e: unknown) => e)) as ContentValidationError;
    expect(error).toBeInstanceOf(ContentValidationError);
    expect(error.file).toBe("content/courses/fx-es/lessons/fx-l1.json");
    expect(error.issues).toContain(
      "exercises.0.correctOptionId: correctOptionId must match one of the option ids",
    );
    expect(error.message).toContain("fx-l1.json");
  });

  it("rejects a lesson that doesn't match its manifest entry", async () => {
    const repo = createFixtureRepository({
      lessons: { "fx-l2": { ...FIXTURE_LESSONS["fx-l1"]!, unitId: "other-unit" } },
    });
    const error = (await repo
      .getLesson(FIXTURE_COURSE_ID, "fx-l2")
      .catch((e: unknown) => e)) as ContentValidationError;
    expect(error.issues).toEqual([
      'id: expected "fx-l2", got "fx-l1"',
      'unitId: expected "fx-unit-1", got "other-unit"',
    ]);
  });

  it("memoises successful loads and retries failed ones", async () => {
    const loaders = fixtureLoaders();
    const load = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValueOnce(new Error("chunk failed"))
      .mockResolvedValue(FIXTURE_LESSONS["fx-l1"]);
    const repo = createContentRepository({
      ...loaders,
      lessons: { [FIXTURE_COURSE_ID]: { ...loaders.lessons[FIXTURE_COURSE_ID], "fx-l1": load } },
    });
    await expect(repo.getLesson(FIXTURE_COURSE_ID, "fx-l1")).rejects.toThrow("chunk failed");
    await repo.getLesson(FIXTURE_COURSE_ID, "fx-l1");
    await repo.getLesson(FIXTURE_COURSE_ID, "fx-l1");
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("preloads lessons without ever rejecting", async () => {
    const repo = createFixtureRepository();
    await expect(
      repo.preloadLessons(FIXTURE_COURSE_ID, ["fx-l1", "nope"]),
    ).resolves.toBeUndefined();
  });

  it("finds lessons and the first lesson path", () => {
    expect(findLesson(FIXTURE_COURSE, "fx-l2")).toMatchObject({
      number: 2,
      unit: { id: "fx-unit-1" },
    });
    expect(findLesson(FIXTURE_COURSE, "nope")).toBeNull();
    expect(firstLessonPath(FIXTURE_COURSE)).toBe("/lesson/fx-l1");
    expect(lessonPath("a b")).toBe("/lesson/a%20b");
  });
});

describe("bundled content (content/courses/en-es)", () => {
  it("loads the default course and every lesson in it", async () => {
    const course = await contentRepository.getCourse(DEFAULT_COURSE_ID);
    expect(course.id).toBe("en-es");
    const ids = course.units.flatMap((u) => u.lessons.map((l) => l.id));
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      const lesson = await contentRepository.getLesson(DEFAULT_COURSE_ID, id);
      expect(lesson.id).toBe(id);
    }
  });

  it("exposes the first lesson path for onboarding and the prerendered lesson routes", async () => {
    expect(await getFirstLessonPath(DEFAULT_COURSE_ID)).toBe("/lesson/u1-l1-hello");
    expect(bundledLessonIds(DEFAULT_COURSE_ID)[0]).toBe("u1-l1-hello");
    expect(bundledLessonPaths(DEFAULT_COURSE_ID)).toContain("/lesson/u1-l5-around-town");
    expect(bundledLessonIds("unknown")).toEqual([]);
  });
});
