import { describe, expect, it } from "vitest";
import { PathNodeSchema, type PathNodeState } from "@/contracts";
import { computePathNodes } from "@/features/path";
import { L, twoUnitCourse, unitOneCourse } from "./fixtures";

type S = PathNodeState;

function states(completed: readonly string[], active: string | null = null): S[] {
  const nodes = computePathNodes(unitOneCourse, completed, active);
  for (const node of nodes) expect(PathNodeSchema.parse(node)).toEqual(node); // AC1
  return nodes.map((node) => node.state);
}

describe("computePathNodes (GAM-008 AC1-AC3)", () => {
  it("returns one node per lesson in manifest order, with lesson and unit ids", () => {
    expect(computePathNodes(unitOneCourse, [], null)).toEqual(
      L.map((lessonId, i) => ({
        lessonId,
        unitId: "unit-1",
        state: i === 0 ? "available" : "locked",
      })),
    );
  });

  it.each<{ name: string; completed: string[]; active?: string | null; expected: S[] }>([
    {
      name: "new learner: L1 available, L2-L5 locked",
      completed: [],
      expected: ["available", "locked", "locked", "locked", "locked"],
    },
    {
      name: "L1 done: L2 available",
      completed: [L[0]],
      expected: ["completed", "available", "locked", "locked", "locked"],
    },
    {
      name: "L1-L3 done: L4 available",
      completed: [L[0], L[1], L[2]],
      expected: ["completed", "completed", "completed", "available", "locked"],
    },
    {
      name: "all 5 done: all completed, none available",
      completed: [...L],
      expected: ["completed", "completed", "completed", "completed", "completed"],
    },
    {
      name: "out of order (L3 done, not L2): L2 available, L3 completed, L4-L5 locked",
      completed: [L[0], L[2]],
      expected: ["completed", "available", "completed", "locked", "locked"],
    },
    {
      name: "only a late lesson done: L1 still the frontier",
      completed: [L[4]],
      expected: ["available", "locked", "locked", "locked", "completed"],
    },
    {
      name: "completed ids in any order and repeated",
      completed: [L[1], L[0], L[1], L[0]],
      expected: ["completed", "completed", "available", "locked", "locked"],
    },
    {
      name: "unknown lesson ids in the results are ignored",
      completed: ["other-course-lesson", "u9-l9"],
      expected: ["available", "locked", "locked", "locked", "locked"],
    },
    {
      name: "unknown ids mixed with real ones",
      completed: ["nope", L[0]],
      expected: ["completed", "available", "locked", "locked", "locked"],
    },
    {
      name: "activeLessonId on the frontier: in_progress",
      completed: [L[0]],
      active: L[1],
      expected: ["completed", "in_progress", "locked", "locked", "locked"],
    },
    {
      name: "activeLessonId on L1 for a new learner: in_progress",
      completed: [],
      active: L[0],
      expected: ["in_progress", "locked", "locked", "locked", "locked"],
    },
    {
      name: "activeLessonId on a completed lesson (replay): stays completed",
      completed: [L[0]],
      active: L[0],
      expected: ["completed", "available", "locked", "locked", "locked"],
    },
    {
      name: "activeLessonId on a locked lesson: ignored",
      completed: [],
      active: L[3],
      expected: ["available", "locked", "locked", "locked", "locked"],
    },
    {
      name: "unknown activeLessonId: ignored",
      completed: [],
      active: "ghost",
      expected: ["available", "locked", "locked", "locked", "locked"],
    },
    {
      name: "activeLessonId with everything done: all completed",
      completed: [...L],
      active: L[4],
      expected: ["completed", "completed", "completed", "completed", "completed"],
    },
  ])("$name", ({ completed, active = null, expected }) => {
    expect(states(completed, active)).toEqual(expected);
  });

  it("at most one node is available or in progress", () => {
    const subsets = Array.from({ length: 1 << L.length }, (_, mask) =>
      L.filter((_, i) => mask & (1 << i)),
    );
    for (const completed of subsets) {
      for (const active of [null, ...L]) {
        const s = states(completed, active);
        const frontier = s.filter((x) => x === "available" || x === "in_progress");
        expect(frontier.length).toBe(completed.length === L.length ? 0 : 1);
        // Everything before the frontier is completed; completed stays completed.
        const fi = s.findIndex((x) => x === "available" || x === "in_progress");
        if (fi >= 0) expect(s.slice(0, fi).every((x) => x === "completed")).toBe(true);
        L.forEach((id, i) => {
          if (completed.includes(id)) expect(s[i]).toBe("completed");
        });
      }
    }
  });

  it("runs across units in course order", () => {
    const nodes = computePathNodes(twoUnitCourse, ["a1", "a2"], null);
    expect(nodes).toEqual([
      { lessonId: "a1", unitId: "unit-1", state: "completed" },
      { lessonId: "a2", unitId: "unit-1", state: "completed" },
      { lessonId: "b1", unitId: "unit-2", state: "available" },
      { lessonId: "b2", unitId: "unit-2", state: "locked" },
    ]);
  });

  it("locks the next unit while the first is unfinished", () => {
    expect(computePathNodes(twoUnitCourse, ["a1"], null).map((n) => n.state)).toEqual([
      "completed",
      "available",
      "locked",
      "locked",
    ]);
  });

  it("does not mutate its inputs", () => {
    const completed = Object.freeze([L[0]]);
    const before = JSON.stringify(unitOneCourse);
    computePathNodes(unitOneCourse, completed, L[1]);
    expect(JSON.stringify(unitOneCourse)).toBe(before);
  });
});
