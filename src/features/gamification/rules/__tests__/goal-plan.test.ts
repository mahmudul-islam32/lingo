import { describe, expect, it } from "vitest";
import {
  CourseSchema,
  GoalPlanStatusSchema,
  type CefrLevel,
  type Course,
  type DailyGoalXp,
  type GoalPlan,
} from "@/contracts";
import enDeCourse from "../../../../../content/courses/en-de/course.json";
import enEsCourse from "../../../../../content/courses/en-es/course.json";
import { computeGoalPlan, levelsWithContent, suggestDailyGoalXp } from "../goal-plan";

const DE: Course = CourseSchema.parse(enDeCourse);
const ES: Course = CourseSchema.parse(enEsCourse);
const idsOf = (level: CefrLevel) =>
  DE.units.filter((u) => u.level === level).flatMap((u) => u.lessons.map((l) => l.id));
const A1 = idsOf("A1");
const A2 = idsOf("A2");

const TODAY = "2026-11-21";
const PLAN: GoalPlan = { targetLevel: "A2", targetDate: "2027-03-12" };

function plan(overrides: Partial<Parameters<typeof computeGoalPlan>[0]> = {}) {
  const input = {
    course: DE,
    completedLessonIds: [] as string[],
    startLevel: "A1" as CefrLevel | undefined,
    goalPlan: PLAN as GoalPlan | null | undefined,
    today: TODAY,
    dailyGoalXp: 20 as DailyGoalXp,
    ...overrides,
  };
  const result = computeGoalPlan(input);
  if (result) expect(GoalPlanStatusSchema.safeParse(result).success).toBe(true);
  return result;
}

describe("computeGoalPlan (GAM-013, ADR-015)", () => {
  it("uses the real en-de course: A1 = 60, A2 = 70 lessons", () => {
    expect(A1).toHaveLength(60);
    expect(A2).toHaveLength(70);
    expect(levelsWithContent(DE)).toEqual(["A1", "A2"]);
  });

  describe("AC1: null", () => {
    it("without a goal plan (missing or null)", () => {
      expect(plan({ goalPlan: null })).toBeNull();
      expect(plan({ goalPlan: undefined })).toBeNull();
    });
    it("when the target level has no content (B1 has no units yet)", () => {
      expect(plan({ goalPlan: { ...PLAN, targetLevel: "B1" } })).toBeNull();
    });
    it("for a course without levels (en-es)", () => {
      expect(levelsWithContent(ES)).toEqual([]);
      expect(plan({ course: ES, goalPlan: { ...PLAN, targetLevel: "A1" } })).toBeNull();
    });
  });

  describe("AC6 worked examples (today 2026-11-21, start A1, A2 by 2027-03-12)", () => {
    it("nothing completed, daily goal 20 → on-track: 130 left, 111 days, 2 a day, 20 XP", () => {
      expect(plan()).toEqual({
        targetLevel: "A2",
        targetDate: "2027-03-12",
        lessonsLeft: 130,
        daysLeft: 111,
        lessonsPerDay: 2,
        suggestedDailyGoalXp: 20,
        status: "on-track",
      });
    });
    it("daily goal 10 → raise-goal (suggested 20)", () => {
      expect(plan({ dailyGoalXp: 10 })).toMatchObject({
        status: "raise-goal",
        lessonsPerDay: 2,
        suggestedDailyGoalXp: 20,
      });
    });
    it("target 2026-12-01 → 10 days, 13 a day, suggested 50, tight", () => {
      expect(plan({ goalPlan: { ...PLAN, targetDate: "2026-12-01" } })).toMatchObject({
        lessonsLeft: 130,
        daysLeft: 10,
        lessonsPerDay: 13,
        suggestedDailyGoalXp: 50,
        status: "tight",
      });
    });
    it("all 130 completed → reached, numbers null", () => {
      expect(plan({ completedLessonIds: [...A1, ...A2] })).toEqual({
        targetLevel: "A2",
        targetDate: "2027-03-12",
        lessonsLeft: 0,
        daysLeft: 111,
        lessonsPerDay: null,
        suggestedDailyGoalXp: null,
        status: "reached",
      });
    });
    it("reached wins on any date, even after the target date", () => {
      expect(plan({ completedLessonIds: [...A1, ...A2], today: "2027-06-01" })).toMatchObject({
        status: "reached",
        daysLeft: -81,
      });
    });
    it("today = 2027-03-12 with lessons left → date-passed (daysLeft 0)", () => {
      expect(plan({ today: "2027-03-12" })).toEqual({
        targetLevel: "A2",
        targetDate: "2027-03-12",
        lessonsLeft: 130,
        daysLeft: 0,
        lessonsPerDay: null,
        suggestedDailyGoalXp: null,
        status: "date-passed",
      });
    });
    it("a date in the past → date-passed with negative daysLeft", () => {
      expect(plan({ today: "2027-03-20" })).toMatchObject({ status: "date-passed", daysLeft: -8 });
    });
    it("start A2 → 70 left even with A1 not completed", () => {
      expect(plan({ startLevel: "A2" })).toMatchObject({ lessonsLeft: 70, lessonsPerDay: 1 });
    });
    it("start A2, target A1 → only A1's not-completed lessons", () => {
      const done = A1.slice(0, 15);
      expect(
        plan({
          startLevel: "A2",
          goalPlan: { ...PLAN, targetLevel: "A1" },
          completedLessonIds: done,
        }),
      ).toMatchObject({ targetLevel: "A1", lessonsLeft: 45 });
    });
  });

  describe("AC2: lessons counted", () => {
    it("missing start level = first level", () => {
      expect(plan({ startLevel: undefined })).toMatchObject({ lessonsLeft: 130 });
    });
    it("unknown or contentless start level = first level", () => {
      expect(plan({ startLevel: "C1" })).toMatchObject({ lessonsLeft: 130 });
    });
    it("target = start level counts just that level", () => {
      expect(plan({ goalPlan: { ...PLAN, targetLevel: "A1" } })).toMatchObject({ lessonsLeft: 60 });
    });
    it("completed lessons (checkpoints included) are not counted; unknown ids are ignored", () => {
      const checkpoints = DE.units
        .flatMap((u) => u.lessons)
        .filter((l) => l.id.includes("checkpoint"))
        .map((l) => l.id);
      expect(checkpoints.length).toBeGreaterThan(0);
      expect(
        plan({ completedLessonIds: [...checkpoints, "not-a-lesson", A2[0]!, A2[0]!] }),
      ).toMatchObject({
        lessonsLeft: 130 - new Set([...checkpoints, A2[0]!]).size,
      });
    });
    it("completed lessons before the start level never change the count", () => {
      expect(plan({ startLevel: "A2", completedLessonIds: A1 })).toMatchObject({ lessonsLeft: 70 });
    });
  });

  describe("AC3: daysLeft uses calendar dates only", () => {
    it("the target day is not counted: tomorrow = 1 day", () => {
      expect(plan({ goalPlan: { ...PLAN, targetDate: "2026-11-22" } })).toMatchObject({
        daysLeft: 1,
        lessonsPerDay: 130,
        status: "tight",
      });
    });
    it("across the EU DST change (29 Mar 2027) and the US one (14 Mar 2027)", () => {
      expect(
        plan({ today: "2027-03-27", goalPlan: { ...PLAN, targetDate: "2027-03-30" } }),
      ).toMatchObject({
        daysLeft: 3,
      });
      expect(
        plan({ today: "2027-03-13", goalPlan: { ...PLAN, targetDate: "2027-03-15" } }),
      ).toMatchObject({
        daysLeft: 2,
      });
    });
    it("across a leap day and a year end", () => {
      expect(
        plan({ today: "2028-02-28", goalPlan: { ...PLAN, targetDate: "2028-03-01" } }),
      ).toMatchObject({
        daysLeft: 2,
      });
      expect(
        plan({ today: "2026-12-31", goalPlan: { ...PLAN, targetDate: "2027-01-01" } }),
      ).toMatchObject({
        daysLeft: 1,
      });
    });
  });

  describe("AC4–5: rounding and thresholds", () => {
    it("lessonsPerDay rounds up", () => {
      // 130 / 44 = 2.95 → 3 lessons → 30 XP.
      expect(plan({ goalPlan: { ...PLAN, targetDate: "2027-01-04" } })).toMatchObject({
        daysLeft: 44,
        lessonsPerDay: 3,
        suggestedDailyGoalXp: 30,
        status: "raise-goal",
      });
    });
    it("required XP equal to the daily goal is on-track; equal to the largest option is raise-goal", () => {
      // 130 / 26 = 5 lessons → 50 XP.
      const fiveADay = { ...PLAN, targetDate: "2026-12-17" };
      expect(plan({ goalPlan: fiveADay, dailyGoalXp: 50 })).toMatchObject({ status: "on-track" });
      expect(plan({ goalPlan: fiveADay, dailyGoalXp: 30 })).toMatchObject({
        status: "raise-goal",
        suggestedDailyGoalXp: 50,
      });
    });
    it("a goal higher than needed is on-track and still suggests the smallest enough option", () => {
      expect(plan({ dailyGoalXp: 50 })).toMatchObject({
        status: "on-track",
        suggestedDailyGoalXp: 20,
      });
    });
  });

  it("suggestDailyGoalXp: smallest option ≥ required, else the largest", () => {
    expect(suggestDailyGoalXp(5)).toBe(10);
    expect(suggestDailyGoalXp(10)).toBe(10);
    expect(suggestDailyGoalXp(11)).toBe(20);
    expect(suggestDailyGoalXp(50)).toBe(50);
    expect(suggestDailyGoalXp(130)).toBe(50);
    expect(suggestDailyGoalXp(25, [50, 10, 30])).toBe(30);
  });

  it("AC7: pure, does not mutate its input", () => {
    const completed = Object.freeze([...A1.slice(0, 3)]);
    const goalPlan = Object.freeze({ ...PLAN });
    const before = JSON.stringify(DE);
    const a = computeGoalPlan({
      course: DE,
      completedLessonIds: completed,
      goalPlan,
      today: TODAY,
      dailyGoalXp: 20,
    });
    const b = computeGoalPlan({
      course: DE,
      completedLessonIds: completed,
      goalPlan,
      today: TODAY,
      dailyGoalXp: 20,
    });
    expect(a).toEqual(b);
    expect(JSON.stringify(DE)).toBe(before);
  });
});
