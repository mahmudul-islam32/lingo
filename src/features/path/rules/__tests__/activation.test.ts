import { describe, expect, it } from "vitest";
import type { PathNode } from "@/contracts";
import {
  computePathNodes,
  findFrontier,
  isPlayable,
  lessonHref,
  resolvePathActivation,
} from "@/features/path";
import { L, unitOneCourse } from "./fixtures";

const nodes = computePathNodes(unitOneCourse, [L[0]], null);
const [completed, available, locked] = nodes as [PathNode, PathNode, PathNode];

describe("isPlayable / findFrontier", () => {
  it.each([
    ["completed", true],
    ["available", true],
    ["in_progress", true],
    ["locked", false],
  ] as const)("%s is playable: %s", (state, expected) => {
    expect(isPlayable({ state })).toBe(expected);
  });

  it("finds the available node", () => {
    expect(findFrontier(nodes)?.lessonId).toBe(L[1]);
  });

  it("finds an in-progress node", () => {
    expect(findFrontier(computePathNodes(unitOneCourse, [], L[0]))?.lessonId).toBe(L[0]);
  });

  it("is undefined when everything is completed", () => {
    expect(findFrontier(computePathNodes(unitOneCourse, [...L], null))).toBeUndefined();
  });
});

describe("resolvePathActivation (GAM-008 AC7-AC9)", () => {
  it.each([
    ["available", available],
    ["completed", completed],
  ] as const)("%s with hearts opens the lesson", (_, node) => {
    expect(resolvePathActivation(node, nodes, true)).toEqual({
      kind: "open",
      lessonId: node.lessonId,
    });
  });

  it("in progress with hearts opens the lesson", () => {
    const withActive = computePathNodes(unitOneCourse, [], L[0]);
    expect(resolvePathActivation(withActive[0]!, withActive, true)).toEqual({
      kind: "open",
      lessonId: L[0],
    });
  });

  it.each([
    ["available", available],
    ["completed", completed],
  ] as const)("%s at 0 hearts hits the gate", (_, node) => {
    expect(resolvePathActivation(node, nodes, false)).toEqual({
      kind: "out_of_hearts",
      lessonId: node.lessonId,
    });
  });

  it.each([true, false])("locked (canStartLesson %s) names the lesson to finish", (can) => {
    expect(resolvePathActivation(locked, nodes, can)).toEqual({
      kind: "locked",
      lessonId: L[2],
      unlockLessonId: L[1],
    });
  });

  it("locked without any frontier reports null", () => {
    const onlyLocked: PathNode[] = [{ ...locked }];
    expect(resolvePathActivation(locked, onlyLocked, true)).toEqual({
      kind: "locked",
      lessonId: L[2],
      unlockLessonId: null,
    });
  });
});

describe("lessonHref", () => {
  it("builds /lesson/<lessonId>", () => {
    expect(lessonHref("u1-l1-hello")).toBe("/lesson/u1-l1-hello");
  });
});
