import { describe, expect, it } from "vitest";
import { lessonNumberOf } from "@/features/path";
import { L, twoUnitCourse, unitOneCourse } from "./fixtures";

describe("lessonNumberOf", () => {
  it.each(L.map((id, i) => [id, i + 1] as const))("%s is Lesson %i", (id, n) => {
    expect(lessonNumberOf(unitOneCourse, id)).toBe(n);
  });

  it("numbers globally across units", () => {
    expect(["a1", "a2", "b1", "b2"].map((id) => lessonNumberOf(twoUnitCourse, id))).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it("is null for a lesson outside the course", () => {
    expect(lessonNumberOf(unitOneCourse, "ghost")).toBeNull();
  });
});
