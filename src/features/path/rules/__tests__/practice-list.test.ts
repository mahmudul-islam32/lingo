import { describe, expect, it } from "vitest";
import { buildPracticeList } from "../practice-list";
import { L, twoUnitCourse, unitOneCourse } from "./fixtures";
import { lessonIdOf, makeLevelCourse } from "./level-fixtures";

const at = (lessonId: string, completedAt: string, courseId = "en-es") => ({
  courseId,
  lessonId,
  completedAt,
});

const ids = (groups: ReturnType<typeof buildPracticeList>) =>
  groups.map((g) => [g.unit.id, g.lessons.map((l) => l.lesson.id)]);

describe("buildPracticeList (GAM-012 AC6, AC8)", () => {
  it("is empty without a completed lesson", () => {
    expect(buildPracticeList(unitOneCourse, [], [])).toEqual([]);
  });

  it("lists only completed lessons, with their number in the unit", () => {
    const groups = buildPracticeList(
      unitOneCourse,
      [L[0], L[2]],
      [at(L[0], "2026-11-18T10:00:00Z"), at(L[2], "2026-11-19T10:00:00Z")],
    );
    expect(ids(groups)).toEqual([["unit-1", [L[2], L[0]]]]);
    expect(groups[0]!.lessons.map((l) => l.lessonNumber)).toEqual([3, 1]);
    expect(groups[0]!.unitNumber).toBe(1);
    expect(groups[0]!.level).toBeNull();
  });

  it("a result for a lesson not in completedLessonIds never shows it", () => {
    const groups = buildPracticeList(unitOneCourse, [L[0]], [at(L[1], "2026-11-19T10:00:00Z")]);
    expect(ids(groups)).toEqual([["unit-1", [L[0]]]]);
  });

  it("ignores ids that aren't in the course", () => {
    expect(buildPracticeList(unitOneCourse, ["nope"], [])).toEqual([]);
  });

  it("orders units and lessons by the most recent play, replays included", () => {
    const groups = buildPracticeList(
      twoUnitCourse,
      ["a1", "a2", "b1"],
      [
        at("a1", "2026-11-16T10:00:00Z"),
        at("a2", "2026-11-17T10:00:00Z"),
        at("b1", "2026-11-18T10:00:00Z"),
        // Replayed a1 today: unit 1 is the most recent again, a1 on top.
        at("a1", "2026-11-19T08:00:00Z"),
      ],
    );
    expect(ids(groups)).toEqual([
      ["unit-1", ["a1", "a2"]],
      ["unit-2", ["b1"]],
    ]);
  });

  it("compares instants, not strings (offsets)", () => {
    const groups = buildPracticeList(
      twoUnitCourse,
      ["a1", "b1"],
      [
        // 09:00+02:00 = 07:00Z is earlier than 08:00Z.
        at("a1", "2026-11-19T09:00:00+02:00"),
        at("b1", "2026-11-19T08:00:00Z"),
      ],
    );
    expect(ids(groups)).toEqual([
      ["unit-2", ["b1"]],
      ["unit-1", ["a1"]],
    ]);
  });

  it("without results falls back to the later course position first", () => {
    const groups = buildPracticeList(twoUnitCourse, ["a1", "a2", "b1"]);
    expect(ids(groups)).toEqual([
      ["unit-2", ["b1"]],
      ["unit-1", ["a2", "a1"]],
    ]);
    expect(groups[0]!.lessons[0]!.lastPlayedAt).toBeNull();
  });

  it("ignores other courses' results for the order", () => {
    const groups = buildPracticeList(
      twoUnitCourse,
      ["a1", "b1"],
      [at("a1", "2026-11-19T10:00:00Z", "en-de"), at("b1", "2026-11-18T10:00:00Z")],
    );
    expect(ids(groups)).toEqual([
      ["unit-2", ["b1"]],
      ["unit-1", ["a1"]],
    ]);
  });

  it("courses with levels number units within their level and carry the level", () => {
    const course = makeLevelCourse({ A1: 2, A2: 1 }, 2);
    const a1u2 = lessonIdOf("A1", 2, 1);
    const a2u1 = lessonIdOf("A2", 1, 2);
    const groups = buildPracticeList(
      course,
      [a1u2, a2u1],
      [at(a1u2, "2026-11-18T10:00:00Z", course.id), at(a2u1, "2026-11-19T10:00:00Z", course.id)],
    );
    expect(groups.map((g) => [g.level, g.unitNumber])).toEqual([
      ["A2", 1],
      ["A1", 2],
    ]);
    expect(groups[0]!.lessons[0]!.lessonNumber).toBe(2);
  });
});
