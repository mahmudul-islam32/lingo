import { describe, expect, it } from "vitest";
import type { Course } from "@/contracts";
import { DEFAULT_COURSE_ID } from "@/lib/content";
import { FIXTURE_COURSE } from "@/lib/content/__fixtures__/fixture-course";
import { GERMAN_FIXTURE_COURSE } from "@/lib/content/__fixtures__/german-fixture-course";
import { courseCaption, currentLevel, learnCourseId } from "./course-caption";

/** The German fixture plus one A2 unit, so the level can change along the path. */
const WITH_A2: Course = {
  ...GERMAN_FIXTURE_COURSE,
  units: [
    ...GERMAN_FIXTURE_COURSE.units,
    {
      id: "de-a2-u01",
      level: "A2",
      title: "Daily Life",
      lessons: [{ id: "de-a2-u01-l1-alltag", title: "Every Day" }],
    },
  ],
};
const A1_IDS = GERMAN_FIXTURE_COURSE.units.flatMap((u) => u.lessons.map((l) => l.id));

describe("learnCourseId (PLT-024 AC 7, 8)", () => {
  it("keeps registered courses, hidden ones included", () => {
    expect(learnCourseId("en-de")).toBe("en-de");
    expect(learnCourseId("en-es")).toBe("en-es");
  });

  it("falls back to the default course without settings or for an unknown course", () => {
    expect(DEFAULT_COURSE_ID).toBe("en-de");
    expect(learnCourseId(undefined)).toBe(DEFAULT_COURSE_ID);
    expect(learnCourseId(null)).toBe(DEFAULT_COURSE_ID);
    expect(learnCourseId("")).toBe(DEFAULT_COURSE_ID);
    expect(learnCourseId("xx-removed")).toBe(DEFAULT_COURSE_ID);
    expect(learnCourseId("constructor")).toBe(DEFAULT_COURSE_ID);
  });
});

describe("currentLevel (PLT-024 AC 9)", () => {
  it("is the level of the available lesson (first not completed)", () => {
    expect(currentLevel(WITH_A2, [])).toBe("A1");
    expect(currentLevel(WITH_A2, A1_IDS.slice(0, 3))).toBe("A1");
    expect(currentLevel(WITH_A2, A1_IDS)).toBe("A2");
  });

  it("follows the path rule: a gap earlier on keeps the earlier level", () => {
    expect(currentLevel(WITH_A2, ["de-a2-u01-l1-alltag"])).toBe("A1");
  });

  it("uses the last lesson's level when everything is done; ignores unknown ids", () => {
    expect(currentLevel(WITH_A2, [...A1_IDS, "de-a2-u01-l1-alltag", "nope"])).toBe("A2");
    expect(currentLevel(GERMAN_FIXTURE_COURSE, A1_IDS)).toBe("A1");
  });

  it("is null for a course without levels", () => {
    expect(currentLevel(FIXTURE_COURSE, [])).toBeNull();
  });
});

describe("courseCaption", () => {
  it('reads "German · A1", or only the course name without levels', () => {
    expect(courseCaption(GERMAN_FIXTURE_COURSE, "A1")).toBe("German · A1");
    expect(courseCaption(WITH_A2, "A2")).toBe("German · A2");
    expect(courseCaption(FIXTURE_COURSE, null)).toBe("Fixture Spanish");
  });
});
