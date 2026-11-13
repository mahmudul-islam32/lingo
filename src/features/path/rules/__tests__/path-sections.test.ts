import { describe, expect, it } from "vitest";
import { flattenCourseLessons, type PathNode } from "@/contracts";
import {
  buildPathSections,
  computePathNodes,
  defaultExpandedLevel,
  findPathLesson,
  pathLevelState,
  type PathLevelSection,
} from "@/features/path";
import { GERMAN_FIXTURE_COURSE } from "@/lib/content/__fixtures__/german-fixture-course";
import { L, twoUnitCourse, unitOneCourse } from "./fixtures";
import { allLessonIds, lessonIdOf, lessonIdsOfLevel, makeLevelCourse } from "./level-fixtures";

const DE = GERMAN_FIXTURE_COURSE;
const DE_IDS = allLessonIds(DE);

function sectionsOf(course = DE, completed: readonly string[] = [], active: string | null = null) {
  return buildPathSections(course, computePathNodes(course, completed, active));
}

function summary(sections: PathLevelSection[]) {
  return sections.map((s) => ({
    level: s.level?.level ?? null,
    state: s.state,
    completed: s.completed,
    total: s.total,
    units: s.units.map((u) => [u.number, u.completed, u.total]),
  }));
}

describe("computePathNodes across units and levels (GAM-010 AC1)", () => {
  it("follows flattenCourseLessons: A1 unit 1 lesson 1 … the last lesson of the last level", () => {
    const course = makeLevelCourse({ A1: 2, A2: 2, B1: 0 });
    const nodes = computePathNodes(course, [], null);
    expect(nodes.map((n) => n.lessonId)).toEqual(
      flattenCourseLessons(course).map((e) => e.lesson.id),
    );
    expect(nodes.map((n) => n.state)).toEqual(["available", ...Array(7).fill("locked")]);
  });

  it("finishing a unit's last lesson makes the next unit's lesson 1 available", () => {
    const nodes = computePathNodes(DE, DE_IDS.slice(0, 2), null);
    expect(nodes.find((n) => n.state === "available")).toEqual({
      lessonId: "de-a1-u02-l1-brot",
      unitId: "de-a1-u02",
      state: "available",
    });
  });

  it("finishing a level's last lesson makes the next level's lesson 1 available", () => {
    const course = makeLevelCourse({ A1: 2, A2: 2 });
    const nodes = computePathNodes(course, lessonIdsOfLevel(course, "A1"), null);
    expect(nodes.find((n) => n.state === "available")?.lessonId).toBe(lessonIdOf("A2", 1, 1));
    expect(nodes.filter((n) => n.state === "available")).toHaveLength(1);
  });
});

describe("buildPathSections (GAM-010 AC2)", () => {
  it("German fixture, new learner: A1 current, A2 coming soon, counts from the data", () => {
    expect(summary(sectionsOf())).toEqual([
      {
        level: "A1",
        state: "current",
        completed: 0,
        total: 4,
        units: [
          [1, 0, 2],
          [2, 0, 2],
        ],
      },
      { level: "A2", state: "coming_soon", completed: 0, total: 0, units: [] },
    ]);
  });

  it("numbers units within their level and lessons within their unit", () => {
    const course = makeLevelCourse({ A1: 2, A2: 2 }, 3);
    const [a1, a2] = sectionsOf(course);
    const entries = a2!.units[1]!.lessons;
    expect(entries.map((e) => [e.unitNumber, e.lessonNumber, e.courseNumber, e.pathIndex])).toEqual(
      [
        [2, 1, 10, 9],
        [2, 2, 11, 10],
        [2, 3, 12, 11],
      ],
    );
    expect(a1!.units.map((u) => u.number)).toEqual([1, 2]);
    expect(a2!.units.map((u) => u.number)).toEqual([1, 2]);
    expect(entries[0]!.lesson).toEqual({ id: lessonIdOf("A2", 2, 1), title: "A2 U2 L1" });
  });

  it("partly done: completed level, current level, locked level", () => {
    const course = makeLevelCourse({ A1: 1, A2: 2, B1: 1, B2: 0, C1: 0 });
    const done = [...lessonIdsOfLevel(course, "A1"), lessonIdOf("A2", 1, 1)];
    expect(summary(sectionsOf(course, done))).toEqual([
      { level: "A1", state: "completed", completed: 2, total: 2, units: [[1, 2, 2]] },
      {
        level: "A2",
        state: "current",
        completed: 1,
        total: 4,
        units: [
          [1, 1, 2],
          [2, 0, 2],
        ],
      },
      { level: "B1", state: "locked", completed: 0, total: 2, units: [[1, 0, 2]] },
      { level: "B2", state: "coming_soon", completed: 0, total: 0, units: [] },
      { level: "C1", state: "coming_soon", completed: 0, total: 0, units: [] },
    ]);
  });

  it("an in-progress lesson makes its level current", () => {
    const [a1] = sectionsOf(DE, [], DE_IDS[0]!);
    expect(a1!.state).toBe("current");
    expect(a1!.units[0]!.lessons[0]!.node.state).toBe("in_progress");
  });

  it("every lesson completed: all levels with content completed, no current level", () => {
    const course = makeLevelCourse({ A1: 1, A2: 1, B1: 0 });
    expect(sectionsOf(course, allLessonIds(course)).map((s) => s.state)).toEqual([
      "completed",
      "completed",
      "coming_soon",
    ]);
  });

  it("out-of-order results: a level with some completed lessons but no frontier is locked", () => {
    const course = makeLevelCourse({ A1: 1, A2: 1 });
    const sections = sectionsOf(course, [lessonIdOf("A2", 1, 2)]);
    expect(summary(sections)[1]).toMatchObject({ state: "locked", completed: 1, total: 2 });
  });

  it("course without levels (en-es): one section with level null, global numbering", () => {
    const sections = sectionsOf(twoUnitCourse, ["a1"]);
    expect(sections).toHaveLength(1);
    expect(summary(sections)).toEqual([
      {
        level: null,
        state: "current",
        completed: 1,
        total: 4,
        units: [
          [1, 1, 2],
          [2, 0, 2],
        ],
      },
    ]);
    const unitTwo = sections[0]!.units[1]!.lessons;
    expect(unitTwo.map((e) => [e.lessonNumber, e.courseNumber])).toEqual([
      [1, 3],
      [2, 4],
    ]);
  });

  it("lessons without a node are left out but keep their numbers", () => {
    const nodes = computePathNodes(unitOneCourse, [], null).filter((n) => n.lessonId !== L[1]);
    const unit = buildPathSections(unitOneCourse, nodes)[0]!.units[0]!;
    expect(unit.total).toBe(4);
    expect(unit.lessons.map((e) => [e.courseNumber, e.pathIndex])).toEqual([
      [1, 0],
      [3, 1],
      [4, 2],
      [5, 3],
    ]);
  });

  it("a level whose units have no nodes at all is locked, not completed", () => {
    const course = makeLevelCourse({ A1: 1, A2: 1 });
    const nodes = computePathNodes(course, [], null).filter((n) => n.unitId !== "a2-u01");
    expect(buildPathSections(course, nodes)[1]).toMatchObject({
      state: "locked",
      completed: 0,
      total: 0,
    });
  });

  it("handles the 5 levels × 18 units × 5 lessons course in one pass", () => {
    const course = makeLevelCourse({ A1: 18, A2: 18, B1: 18, B2: 18, C1: 18 }, 5);
    const sections = sectionsOf(course, [
      ...lessonIdsOfLevel(course, "A1"),
      ...lessonIdsOfLevel(course, "A2"),
    ]);
    expect(sections.map((s) => [s.level?.level, s.state, s.total])).toEqual([
      ["A1", "completed", 90],
      ["A2", "completed", 90],
      ["B1", "current", 90],
      ["B2", "locked", 90],
      ["C1", "locked", 90],
    ]);
    expect(sections.at(-1)!.units.at(-1)!.lessons.at(-1)!.pathIndex).toBe(449);
  });
});

describe("pathLevelState", () => {
  const unit = (states: PathNode["state"][]) => {
    const lessons = states.map((state, i) => ({
      node: { lessonId: `l${i}`, unitId: "u", state },
      lesson: { id: `l${i}`, title: `L${i}` },
      lessonNumber: i + 1,
      courseNumber: i + 1,
      unitNumber: 1,
      pathIndex: i,
    }));
    return {
      unit: { id: "u", title: "U", lessons: lessons.map((e) => e.lesson) },
      number: 1,
      lessons,
      completed: states.filter((s) => s === "completed").length,
      total: states.length,
    };
  };

  it.each<[string, PathNode["state"][][], ReturnType<typeof pathLevelState>]>([
    ["no units", [], "coming_soon"],
    ["available lesson", [["completed", "available"]], "current"],
    ["in-progress lesson in a later unit", [["completed"], ["in_progress"]], "current"],
    ["all completed", [["completed"], ["completed", "completed"]], "completed"],
    ["all locked", [["locked", "locked"]], "locked"],
    ["mixed completed and locked", [["completed", "locked"]], "locked"],
    ["units without nodes", [[]], "locked"],
  ])("%s → %s", (_, units, expected) => {
    expect(pathLevelState(units.map(unit))).toBe(expected);
  });
});

describe("defaultExpandedLevel (GAM-010 AC6)", () => {
  it("is the current level", () => {
    expect(defaultExpandedLevel(sectionsOf())).toBe("A1");
    const course = makeLevelCourse({ A1: 1, A2: 1, B1: 1 });
    expect(defaultExpandedLevel(sectionsOf(course, lessonIdsOfLevel(course, "A1")))).toBe("A2");
  });

  it("is the last completed level when every lesson is completed", () => {
    const course = makeLevelCourse({ A1: 1, A2: 1, B1: 0 });
    expect(defaultExpandedLevel(sectionsOf(course, allLessonIds(course)))).toBe("A2");
  });

  it("is null without levels, current or completed", () => {
    expect(defaultExpandedLevel(sectionsOf(unitOneCourse))).toBeNull();
    expect(defaultExpandedLevel(sectionsOf(unitOneCourse, [...L]))).toBeNull();
    expect(defaultExpandedLevel([])).toBeNull();
  });
});

describe("findPathLesson", () => {
  it("finds a lesson's entry across levels and units", () => {
    const course = makeLevelCourse({ A1: 2, A2: 2 });
    const entry = findPathLesson(sectionsOf(course), lessonIdOf("A2", 2, 2));
    expect(entry).toMatchObject({ unitNumber: 2, lessonNumber: 2, courseNumber: 8 });
  });

  it("returns null for an id that isn't on the path", () => {
    expect(findPathLesson(sectionsOf(), "nope")).toBeNull();
  });
});
