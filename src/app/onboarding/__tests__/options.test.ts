import { describe, expect, it } from "vitest";
import { CourseSchema, DAILY_GOAL_OPTIONS } from "@/contracts";
import { listBundledCourses as loadCourses } from "@/lib/content";
import { courseSubtitle, languageName } from "../course-labels";
import { GOAL_OPTIONS } from "../goal-options";

describe("goal options", () => {
  it("follow the contract options, in order, each with a label and hint", () => {
    expect(GOAL_OPTIONS.map((o) => o.xp)).toEqual([...DAILY_GOAL_OPTIONS]);
    expect(GOAL_OPTIONS.map((o) => `${o.label}: ${o.hint}`)).toEqual([
      "Casual: About 1 lesson a day",
      "Regular: About 2 lessons a day",
      "Serious: About 3 lessons a day",
      "Intense: About 5 lessons a day",
    ]);
  });
});

describe("course loader", () => {
  it("loads the bundled en-es course, valid against CourseSchema", async () => {
    const courses = await loadCourses();
    expect(courses.map((c) => c.id)).toEqual(["en-es"]);
    expect(() => CourseSchema.parse(courses[0])).not.toThrow();
    expect(courses[0]!.title).toBe("Spanish");
    expect(courseSubtitle(courses[0]!)).toBe("for English speakers");
  });

  it("names languages in English and falls back to the code", () => {
    expect(languageName("es")).toBe("Spanish");
    expect(languageName("zz")).toBe("zz");
  });
});
