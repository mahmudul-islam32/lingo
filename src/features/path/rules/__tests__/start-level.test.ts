/**
 * GAM-011 AC1–AC6 (ADR-013 §1, PD-064): the start level in the path rule and the helpers
 * built on it (frontier, display state, level sections, start gate).
 */
import { describe, expect, it } from "vitest";
import {
  PathNodeSchema,
  type CefrLevel,
  type Course,
  type PathNode,
  type PathNodeState,
} from "@/contracts";
import { computeUserProgress, createFullHearts } from "@/features/gamification";
import {
  buildPathSections,
  canStartNode,
  computePathNodes,
  defaultExpandedLevel,
  findFrontier,
  isLevelFullyLocked,
  pathNodeDisplay,
  resolvePathActivation,
  startLessonIndex,
} from "@/features/path";
import { makeResult } from "../../../gamification/rules/__tests__/fixtures";
import { L, unitOneCourse } from "./fixtures";
import { allLessonIds, lessonIdOf, lessonIdsOfLevel, makeLevelCourse } from "./level-fixtures";

/** A1 (2 units × 2), A2 (2 units × 2), B1 (1 unit × 2), B2 declared without units. */
const COURSE = makeLevelCourse({ A1: 2, A2: 2, B1: 1, B2: 0 });
const A1 = lessonIdsOfLevel(COURSE, "A1");
const A2 = lessonIdsOfLevel(COURSE, "A2");
const B1 = lessonIdsOfLevel(COURSE, "B1");
const ALL = allLessonIds(COURSE);

type S = PathNodeState;

function states(
  completed: readonly string[],
  startLevel?: CefrLevel,
  active: string | null = null,
  course: Course = COURSE,
): S[] {
  const nodes = computePathNodes(course, completed, active, startLevel);
  for (const node of nodes) expect(PathNodeSchema.parse(node)).toEqual(node);
  return nodes.map((node) => node.state);
}

const repeat = (state: S, n: number): S[] => Array.from({ length: n }, () => state);

describe("startLessonIndex", () => {
  it("is the path index of the first lesson of the level", () => {
    expect(startLessonIndex(COURSE, "A1")).toBe(0);
    expect(startLessonIndex(COURSE, "A2")).toBe(4);
    expect(startLessonIndex(COURSE, "B1")).toBe(8);
  });

  it("falls back to 0 for missing, unknown or contentless levels and courses without levels", () => {
    expect(startLessonIndex(COURSE)).toBe(0);
    expect(startLessonIndex(COURSE, null)).toBe(0);
    expect(startLessonIndex(COURSE, "B2")).toBe(0); // declared, no units
    expect(startLessonIndex(COURSE, "C1")).toBe(0); // not a level of the course
    expect(startLessonIndex(unitOneCourse, "A2")).toBe(0);
  });

  it("skips a unit of the level that has no lessons", () => {
    const course = makeLevelCourse({ A1: 1, A2: 1 });
    const emptyFirst: Course = {
      ...course,
      units: [
        course.units[0]!,
        { ...course.units[1]!, id: "a2-u00", lessons: [] },
        course.units[1]!,
      ],
    };
    expect(startLessonIndex(emptyFirst, "A2")).toBe(2);
    const noLessons: Course = {
      ...course,
      units: [course.units[0]!, { ...course.units[1]!, lessons: [] }],
    };
    expect(startLessonIndex(noLessons, "A2")).toBe(0);
  });
});

describe("computePathNodes with a start level (GAM-011 AC1–AC6)", () => {
  it("AC1: no start level, the first level, unknown or contentless level = today's output", () => {
    for (const completed of [[], [A1[0]!], [A1[0]!, A1[2]!], ALL]) {
      const today = computePathNodes(COURSE, completed, null);
      for (const level of [undefined, "A1", "B2", "C2"] as const) {
        expect(computePathNodes(COURSE, completed, null, level)).toEqual(today);
      }
    }
    expect(computePathNodes(unitOneCourse, [L[0]], L[1], "B1")).toEqual(
      computePathNodes(unitOneCourse, [L[0]], L[1]),
    );
  });

  it("AC2: start A2: A1 open, first A2 lesson up next, the rest locked", () => {
    expect(states([], "A2")).toEqual([
      ...repeat("available", 4),
      "available",
      ...repeat("locked", 3),
      ...repeat("locked", 2),
    ]);
    const nodes = computePathNodes(COURSE, [], null, "A2");
    expect(findFrontier(nodes, startLessonIndex(COURSE, "A2"))?.lessonId).toBe(A2[0]);
  });

  it("AC2: A1 lessons with a result are completed; results in the skipped level count", () => {
    expect(states([A1[1]!, A1[3]!], "A2")).toEqual([
      "available",
      "completed",
      "available",
      "completed",
      "available",
      ...repeat("locked", 5),
    ]);
  });

  it("AC3: start level completed: the normal rule continues into the next level", () => {
    expect(states([...A2], "A2")).toEqual([
      ...repeat("available", 4),
      ...repeat("completed", 4),
      "available",
      "locked",
    ]);
  });

  it("start level partly completed: the first not-completed lesson is up next", () => {
    expect(states([A2[0]!, A2[2]!], "A2")).toEqual([
      ...repeat("available", 4),
      "completed",
      "available",
      "completed",
      "locked",
      "locked",
      "locked",
    ]);
  });

  it("everything from the start level on completed: no up-next, earlier lessons open", () => {
    const nodes = computePathNodes(COURSE, [...A2, ...B1], null, "A2");
    expect(nodes.map((n) => n.state)).toEqual([
      ...repeat("available", 4),
      ...repeat("completed", 6),
    ]);
    expect(findFrontier(nodes, 4)).toBeUndefined();
  });

  it("AC4: lowering A2 -> A1 relocks; completed stay completed", () => {
    const completed = [A2[0]!, A2[1]!];
    expect(states(completed, "A2")).toEqual([
      ...repeat("available", 4),
      "completed",
      "completed",
      "available",
      "locked",
      "locked",
      "locked",
    ]);
    expect(states(completed, "A1")).toEqual([
      "available",
      ...repeat("locked", 3),
      "completed",
      "completed",
      ...repeat("locked", 4),
    ]);
  });

  it("start B1 opens A1 and A2", () => {
    expect(states([], "B1")).toEqual([...repeat("available", 8), "available", "locked"]);
  });

  it("activeLessonId marks only the frontier; an open earlier lesson stays available", () => {
    expect(states([], "A2", A2[0]!)[4]).toBe("in_progress");
    expect(states([], "A2", A1[0]!)).toEqual(states([], "A2"));
  });

  it("AC5: the start level creates no results, XP or lesson counts", () => {
    const results = [A1[0]!, A2[0]!].map((lessonId) =>
      makeResult({ courseId: COURSE.id, unitId: "x", lessonId, localDate: "2026-11-18" }),
    );
    const now = new Date("2026-11-18T12:00:00.000Z");
    const before = JSON.stringify(results);
    const progressFor = (startLevel: CefrLevel) => {
      computePathNodes(
        COURSE,
        results.map((r) => r.lessonId),
        null,
        startLevel,
      );
      return computeUserProgress({
        courseId: COURSE.id,
        results,
        hearts: createFullHearts(now),
        goalXp: 20,
        today: "2026-11-18",
        now,
      });
    };
    const progress = progressFor("A2");
    expect(progressFor("A1")).toEqual(progress);
    expect(JSON.stringify(results)).toBe(before);
    const ids = results.map((r) => r.lessonId);
    const a1 = computePathNodes(COURSE, ids, null, "A1");
    const a2 = computePathNodes(COURSE, ids, null, "A2");
    // The path never feeds progress: the same results give the same XP and counts.
    expect(a1.filter((n) => n.state === "completed")).toEqual(
      a2.filter((n) => n.state === "completed"),
    );
    expect(progress.totalXp).toBeGreaterThan(0);
    expect(progress.lessonsCompletedCount).toBe(2);
    expect(a2.filter((n) => n.state === "completed")).toHaveLength(progress.lessonsCompletedCount);
  });

  it("does not mutate its inputs", () => {
    const completed = Object.freeze([A1[0]!]);
    const before = JSON.stringify(COURSE);
    computePathNodes(COURSE, completed, null, "A2");
    expect(JSON.stringify(COURSE)).toBe(before);
  });
});

describe("frontier, display and gate helpers (GAM-011)", () => {
  const nodes = computePathNodes(COURSE, [A1[1]!], null, "A2");
  const frontierId = findFrontier(nodes, 4)!.lessonId;
  const byId = (id: string) => nodes.find((n) => n.lessonId === id)!;

  it("findFrontier without a start index keeps the GAM-008 meaning", () => {
    expect(findFrontier(nodes)?.lessonId).toBe(A1[0]);
    expect(frontierId).toBe(A2[0]);
  });

  it("pathNodeDisplay: open for skipped lessons, the state otherwise", () => {
    expect(pathNodeDisplay(byId(A1[0]!), frontierId)).toBe("open");
    expect(pathNodeDisplay(byId(A1[1]!), frontierId)).toBe("completed");
    expect(pathNodeDisplay(byId(A2[0]!), frontierId)).toBe("available");
    expect(pathNodeDisplay(byId(A2[1]!), frontierId)).toBe("locked");
    const inProgress: PathNode = { ...byId(A2[0]!), state: "in_progress" };
    expect(pathNodeDisplay(inProgress, frontierId)).toBe("in_progress");
    expect(pathNodeDisplay(byId(A2[0]!), null)).toBe("open");
  });

  it.each<{ state: S; hearts: number; expected: boolean }>([
    { state: "locked", hearts: 5, expected: false },
    { state: "locked", hearts: 0, expected: false },
    { state: "completed", hearts: 0, expected: true },
    { state: "completed", hearts: 3, expected: true },
    { state: "available", hearts: 0, expected: false },
    { state: "available", hearts: 1, expected: true },
    { state: "in_progress", hearts: 0, expected: false },
  ])("canStartNode($state, $hearts) = $expected (AC18)", ({ state, hearts, expected }) => {
    expect(canStartNode({ state }, hearts)).toBe(expected);
    expect(canStartNode({ state }, { canStartLesson: hearts > 0 })).toBe(expected);
  });

  it("canStartNode: practice costs hearts when configured so", () => {
    expect(canStartNode({ state: "completed" }, 0, { practiceCostsHearts: true })).toBe(false);
  });

  it("resolvePathActivation: an open lesson at 0 hearts hits the gate; locked names the frontier", () => {
    expect(resolvePathActivation(byId(A1[0]!), nodes, false, 4).kind).toBe("out_of_hearts");
    expect(resolvePathActivation(byId(A1[0]!), nodes, true, 4).kind).toBe("open");
    expect(resolvePathActivation(byId(A2[2]!), nodes, true, 4)).toEqual({
      kind: "locked",
      lessonId: A2[2],
      unlockLessonId: A2[0],
    });
  });
});

describe("buildPathSections with a start level (GAM-011)", () => {
  const levelStates = (completed: string[], startLevel?: CefrLevel) =>
    buildPathSections(
      COURSE,
      computePathNodes(COURSE, completed, null, startLevel),
      startLevel,
    ).map((s) => [s.level?.level, s.state]);

  it("skipped levels are open, the start level current, later levels locked", () => {
    expect(levelStates([], "B1")).toEqual([
      ["A1", "open"],
      ["A2", "open"],
      ["B1", "current"],
      ["B2", "coming_soon"],
    ]);
  });

  it("a fully completed skipped level is completed", () => {
    expect(levelStates([...A1], "A2")).toEqual([
      ["A1", "completed"],
      ["A2", "current"],
      ["B1", "locked"],
      ["B2", "coming_soon"],
    ]);
  });

  it("without a start level the GAM-010 states are unchanged", () => {
    expect(levelStates([])).toEqual([
      ["A1", "current"],
      ["A2", "locked"],
      ["B1", "locked"],
      ["B2", "coming_soon"],
    ]);
  });

  it("defaultExpandedLevel: current, else the first open level, else the last completed", () => {
    const expanded = (completed: string[], startLevel?: CefrLevel) =>
      defaultExpandedLevel(
        buildPathSections(
          COURSE,
          computePathNodes(COURSE, completed, null, startLevel),
          startLevel,
        ),
      );
    expect(expanded([], "A2")).toBe("A2");
    expect(expanded([...A2, ...B1], "A2")).toBe("A1");
    expect(expanded(ALL)).toBe("B1");
  });

  it("isLevelFullyLocked: only levels whose lessons are all locked", () => {
    const sections = buildPathSections(
      COURSE,
      computePathNodes(COURSE, [lessonIdOf("B1", 1, 2)], null),
    );
    expect(sections.map(isLevelFullyLocked)).toEqual([false, true, false, false]);
  });
});
