import { beforeEach, describe, expect, it } from "vitest";
import type { Course, GoalPlanStatus } from "@/contracts";
import { listAvailableCourses, listBundledCourses } from "@/lib/content";
import {
  defaultGoalLevel,
  goalDateBounds,
  goalDateRowValue,
  goalLevelOptions,
  goalPlanPreview,
  isValidGoalDate,
  validateGoalDate,
  GOAL_DATE_HREF,
} from "..";
import { GOAL_PLAN_EDIT_HREF } from "@/features/gamification";

let german: Course;
let spanish: Course;

beforeEach(async () => {
  [german] = await listAvailableCourses();
  spanish = (await listBundledCourses()).find((c) => c.id === "en-es")!;
});

const TODAY = "2026-11-21";

describe("goal date helpers (PLT-027)", () => {
  it("offers levels with content from the start level on; none without levels", () => {
    expect(goalLevelOptions(german, undefined).map((o) => o.level)).toEqual(["A1", "A2"]);
    expect(goalLevelOptions(german, "A2").map((o) => o.level)).toEqual(["A2"]);
    expect(goalLevelOptions(spanish, undefined)).toEqual([]);
  });

  it("preselects the saved level, else the last offered one", () => {
    expect(defaultGoalLevel(["A1", "A2"], null)).toBe("A2");
    expect(defaultGoalLevel(["A1", "A2"], { targetLevel: "A1", targetDate: TODAY })).toBe("A1");
    expect(defaultGoalLevel(["A2"], { targetLevel: "A1", targetDate: TODAY })).toBe("A2");
    expect(defaultGoalLevel([], null)).toBeNull();
  });

  it("bounds the date from tomorrow to today + 730 and validates on save", () => {
    expect(goalDateBounds(TODAY)).toEqual({ min: "2026-11-22", max: "2028-11-20" });
    expect(validateGoalDate("", TODAY)).toBe("empty");
    expect(validateGoalDate("2026-02-30", TODAY)).toBe("empty");
    expect(validateGoalDate(TODAY, TODAY)).toBe("notAfterToday");
    expect(validateGoalDate("2026-11-22", TODAY)).toBeNull();
    expect(validateGoalDate("2028-11-20", TODAY)).toBeNull();
    expect(validateGoalDate("2028-11-21", TODAY)).toBe("tooLate");
    expect(isValidGoalDate("2027-03-12", TODAY)).toBe(true);
  });

  it("formats the row value", () => {
    expect(GOAL_DATE_HREF).toBe(GOAL_PLAN_EDIT_HREF);
    expect(goalDateRowValue({ targetLevel: "A2", targetDate: "2027-03-12" })).toBe(
      "Finish A2 by 12 Mar 2027",
    );
    expect(goalDateRowValue(null)).toBe("Not set");
    expect(goalDateRowValue(undefined)).toBe("Not set");
  });

  it("writes the preview per status", () => {
    const base = { targetLevel: "A2", targetDate: "2027-03-12", daysLeft: 111 } as const;
    const onTrack: GoalPlanStatus = {
      ...base,
      lessonsLeft: 130,
      lessonsPerDay: 2,
      suggestedDailyGoalXp: 20,
      status: "on-track",
    };
    expect(goalPlanPreview(onTrack)).toEqual([
      "130 lessons left · about 2 lessons a day. Suggested daily goal: 20 XP.",
    ]);
    expect(
      goalPlanPreview({ ...onTrack, lessonsLeft: 1, lessonsPerDay: 1, suggestedDailyGoalXp: 10 }),
    ).toEqual(["1 lesson left · about 1 lesson a day. Suggested daily goal: 10 XP."]);
    expect(goalPlanPreview({ ...onTrack, status: "tight" })[1]).toBe(
      "This date is tight. You could pick a later date.",
    );
    expect(
      goalPlanPreview({
        ...base,
        lessonsLeft: 0,
        lessonsPerDay: null,
        suggestedDailyGoalXp: null,
        status: "reached",
      }),
    ).toEqual(["You've already finished A2."]);
    expect(
      goalPlanPreview({
        ...base,
        lessonsLeft: 3,
        daysLeft: 0,
        lessonsPerDay: null,
        suggestedDailyGoalXp: null,
        status: "date-passed",
      }),
    ).toEqual([]);
    expect(goalPlanPreview(null)).toEqual([]);
  });
});
