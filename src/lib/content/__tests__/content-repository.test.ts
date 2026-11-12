// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { groupUnitsByLevel } from "@/contracts";
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
  COURSE_REGISTRY,
  listAvailableCourses,
  listBundledCourses,
} from "../index";
import {
  allBundledLessonPaths,
  bundledCourseIdOfLesson,
  bundledCourseIds,
  bundledLessonIds,
  bundledLessonPaths,
} from "../static-params";
import {
  createFixtureRepository,
  FIXTURE_COURSE,
  FIXTURE_COURSE_ID,
  FIXTURE_LESSONS,
  fixtureLoaders,
} from "../__fixtures__/fixture-course";
import {
  createGermanFixtureRepository,
  GERMAN_FIXTURE_COURSE,
  GERMAN_FIXTURE_COURSE_ID,
  GERMAN_FIXTURE_LESSONS,
} from "../__fixtures__/german-fixture-course";

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

describe.each(["en-de", "en-es"])("bundled content (content/courses/%s)", (courseId) => {
  it("loads the course and every lesson in it", async () => {
    const course = await contentRepository.getCourse(courseId);
    expect(course.id).toBe(courseId);
    const ids = course.units.flatMap((u) => u.lessons.map((l) => l.id));
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      const lesson = await contentRepository.getLesson(courseId, id);
      expect(lesson.id).toBe(id);
    }
  });
});

describe("course registry (CTO-008)", () => {
  it("defaults to German for English speakers, A1, and keeps en-es bundled", async () => {
    expect(DEFAULT_COURSE_ID).toBe("en-de");
    expect(bundledCourseIds()).toEqual(["en-de", "en-es"]);
    const german = await contentRepository.getCourse("en-de");
    expect(german).toMatchObject({
      title: "German",
      learningLanguage: "de",
      knownLanguage: "en",
    });
    expect(german.levels?.[0]?.level).toBe("A1");
    expect(german.units[0]!.level).toBe("A1");
    expect((await listBundledCourses()).map((c) => c.id)).toEqual(["en-de", "en-es"]);
  });

  it("lists en-de as available and keeps the hidden en-es loadable (PD-030)", async () => {
    expect(COURSE_REGISTRY).toEqual([
      { id: "en-de", visibility: "available" },
      { id: "en-es", visibility: "hidden" },
    ]);
    expect((await listAvailableCourses()).map((c) => c.id)).toEqual(["en-de"]);
    expect((await contentRepository.getCourse("en-es")).title).toBe("Spanish");
    const repo = createGermanFixtureRepository();
    expect(
      (
        await listAvailableCourses(repo, [
          { id: "en-de", visibility: "hidden" },
          { id: GERMAN_FIXTURE_COURSE_ID, visibility: "available" },
        ])
      ).map((c) => c.id),
    ).toEqual(["en-de"]);
    expect(await listAvailableCourses(repo, [])).toEqual([]);
  });

  it("exposes first lesson paths and the prerendered lesson routes of every course", async () => {
    expect(await getFirstLessonPath(DEFAULT_COURSE_ID)).toBe(
      lessonPath(bundledLessonIds(DEFAULT_COURSE_ID)[0]!),
    );
    expect(await getFirstLessonPath("en-es")).toBe("/lesson/u1-l1-hello");
    expect(bundledLessonIds("en-es")[0]).toBe("u1-l1-hello");
    expect(bundledLessonPaths("en-es")).toContain("/lesson/u1-l5-around-town");
    expect(bundledLessonIds("unknown")).toEqual([]);
    expect(bundledLessonIds("__proto__")).toEqual([]);
    expect(allBundledLessonPaths()).toEqual([
      ...bundledLessonPaths("en-de"),
      ...bundledLessonPaths("en-es"),
    ]);
  });

  it("finds the course of a lesson; lesson ids are unique across courses", () => {
    expect(bundledCourseIdOfLesson("u1-l1-hello")).toBe("en-es");
    expect(bundledCourseIdOfLesson(bundledLessonIds("en-de")[0]!)).toBe("en-de");
    expect(bundledCourseIdOfLesson("nope")).toBeNull();
    const all = bundledCourseIds().flatMap(bundledLessonIds);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("German fixture course (CTO-008 criterion 12)", () => {
  it("has A1 with 2 units × 2 lessons and A2 without units, all loadable", async () => {
    const repo = createGermanFixtureRepository();
    const course = await repo.getCourse(GERMAN_FIXTURE_COURSE_ID);
    expect(course).toEqual(GERMAN_FIXTURE_COURSE);
    expect(groupUnitsByLevel(course).map((g) => [g.level.level, g.units.length])).toEqual([
      ["A1", 2],
      ["A2", 0],
    ]);
    expect(course.units.map((u) => u.lessons.length)).toEqual([2, 2]);
    for (const id of Object.keys(GERMAN_FIXTURE_LESSONS)) {
      expect((await repo.getLesson(GERMAN_FIXTURE_COURSE_ID, id)).id).toBe(id);
    }
  });
});
