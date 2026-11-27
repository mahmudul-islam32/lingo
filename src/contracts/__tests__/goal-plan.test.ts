import { describe, expect, it } from "vitest";
import {
  GAME_CONFIG,
  GameConfigSchema,
  GoalPlanSchema,
  GoalPlanStatusSchema,
  SettingsSchema,
  type GoalPlanStatus,
  type Settings,
  type SettingsPatch,
} from "../index";
import { settings } from "./fixtures";

const plan = { targetLevel: "A2", targetDate: "2027-03-12" } as const;

/** Same merge as the settings repository's `updateSettings` (spread, then validate). */
function applyPatch(current: Settings, patch: SettingsPatch): Settings {
  return SettingsSchema.parse({ ...current, ...patch });
}

describe("GoalPlanSchema (CTO-017)", () => {
  it("accepts a target level and a local date", () => {
    expect(GoalPlanSchema.parse(plan)).toEqual(plan);
  });

  it.each([
    ["an unknown level", { ...plan, targetLevel: "D1" }],
    ["a lowercase level", { ...plan, targetLevel: "a2" }],
    ["a non-ISO date", { ...plan, targetDate: "12/03/2027" }],
    ["a date-time string", { ...plan, targetDate: "2027-03-12T00:00:00.000Z" }],
    ["an impossible date", { ...plan, targetDate: "2027-02-30" }],
    ["a missing targetDate", { targetLevel: "A2" }],
    ["a missing targetLevel", { targetDate: "2027-03-12" }],
  ])("rejects %s", (_, value) => {
    expect(GoalPlanSchema.safeParse(value).success).toBe(false);
  });
});

describe("SettingsSchema.goalPlan (CTO-017)", () => {
  it("keeps settings stored before CTO-017 valid: goalPlan is optional", () => {
    expect("goalPlan" in settings).toBe(false);
    expect(SettingsSchema.parse(settings)).not.toHaveProperty("goalPlan");
  });

  it("accepts a plan and null (no goal date)", () => {
    expect(SettingsSchema.parse({ ...settings, goalPlan: plan }).goalPlan).toEqual(plan);
    expect(SettingsSchema.parse({ ...settings, goalPlan: null }).goalPlan).toBeNull();
  });

  it("rejects an invalid plan inside settings", () => {
    const goalPlan = { ...plan, targetLevel: "D1" };
    expect(SettingsSchema.safeParse({ ...settings, goalPlan }).success).toBe(false);
  });

  it("the settings patch can no longer write the legacy goalPlan (CTO-021, ADR-018 §5)", () => {
    // @ts-expect-error -- goal dates are written per course with `goalPlanUpdate` only.
    const legacy: SettingsPatch = { goalPlan: plan };
    const perCourse: SettingsPatch = {
      goalPlanUpdate: { courseId: settings.courseId, goalPlan: plan },
    };
    expect(legacy).toBeDefined();
    expect(perCourse.goalPlanUpdate?.goalPlan).toEqual(plan);
  });

  it("a patch without goal fields keeps a stored legacy plan", () => {
    const stored = SettingsSchema.parse({ ...settings, goalPlan: plan });
    expect(applyPatch(stored, { dailyGoalXp: 30 }).goalPlan).toEqual(plan);
  });
});

describe("GAME_CONFIG.goalPlanMaxDays (CTO-017)", () => {
  it("is 730 days and validated by GameConfigSchema", () => {
    expect(GAME_CONFIG.goalPlanMaxDays).toBe(730);
    expect(GameConfigSchema.safeParse({ ...GAME_CONFIG, goalPlanMaxDays: 0 }).success).toBe(false);
    expect(GameConfigSchema.safeParse({ ...GAME_CONFIG, goalPlanMaxDays: 1.5 }).success).toBe(
      false,
    );
  });
});

describe("GoalPlanStatusSchema (CTO-017)", () => {
  const onTrack: GoalPlanStatus = {
    targetLevel: "A2",
    targetDate: "2027-03-12",
    lessonsLeft: 130,
    daysLeft: 111,
    lessonsPerDay: 2,
    suggestedDailyGoalXp: 20,
    status: "on-track",
  };
  const reached: GoalPlanStatus = {
    ...onTrack,
    lessonsLeft: 0,
    lessonsPerDay: null,
    suggestedDailyGoalXp: null,
    status: "reached",
  };
  const datePassed: GoalPlanStatus = {
    ...onTrack,
    daysLeft: 0,
    lessonsPerDay: null,
    suggestedDailyGoalXp: null,
    status: "date-passed",
  };

  it.each([
    ["on-track", onTrack],
    ["raise-goal", { ...onTrack, status: "raise-goal" }],
    [
      "tight",
      { ...onTrack, daysLeft: 10, lessonsPerDay: 13, suggestedDailyGoalXp: 50, status: "tight" },
    ],
    ["reached", reached],
    ["reached after the date", { ...reached, daysLeft: -5 }],
    ["date-passed", datePassed],
    ["date-passed with negative days", { ...datePassed, daysLeft: -3 }],
  ])("accepts %s", (_, value) => {
    expect(GoalPlanStatusSchema.safeParse(value).success).toBe(true);
  });

  it.each([
    ["an unknown status", { ...onTrack, status: "behind" }],
    ["negative lessonsLeft", { ...onTrack, lessonsLeft: -1 }],
    ["lessonsPerDay 0", { ...onTrack, lessonsPerDay: 0 }],
    ["a suggestion outside dailyGoalOptions", { ...onTrack, suggestedDailyGoalXp: 25 }],
    ["null lessonsPerDay while on-track", { ...onTrack, lessonsPerDay: null }],
    ["null suggestion while on-track", { ...onTrack, suggestedDailyGoalXp: null }],
    ["lessonsPerDay set while reached", { ...reached, lessonsPerDay: 1 }],
    ["suggestion set while date-passed", { ...datePassed, suggestedDailyGoalXp: 20 }],
    ["reached with lessons left", { ...reached, lessonsLeft: 3 }],
    ["on-track with no lessons left", { ...onTrack, lessonsLeft: 0 }],
    ["on-track with the date passed", { ...onTrack, daysLeft: 0 }],
    ["date-passed with days left", { ...datePassed, daysLeft: 4 }],
    ["a date-time targetDate", { ...onTrack, targetDate: "2027-03-12T00:00:00Z" }],
  ])("rejects %s", (_, value) => {
    expect(GoalPlanStatusSchema.safeParse(value).success).toBe(false);
  });
});
