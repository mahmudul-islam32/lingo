import { describe, expect, it } from "vitest";
import {
  CONTRACTS_VERSION,
  GoalPlansSchema,
  GoalPlanUpdateSchema,
  SettingsSchema,
  SyncQueueRecordSchema,
  goalPlanFor,
  normalizeGoalPlans,
  withGoalPlan,
  type Settings,
  type SettingsPatch,
} from "../index";
import { settings, UUID_A } from "./fixtures";

/**
 * CTO-018 (ADR-018, PD-078): one goal plan per course. Criteria numbers refer to the
 * ticket.
 */
const GERMAN = "en-de";
const TELC = "telc-b1-en-de";
const a2 = { targetLevel: "A2", targetDate: "2027-03-12" } as const;
const b1 = { targetLevel: "B1", targetDate: "2027-06-30" } as const;

/** A settings record as v0.5.4 stored it: one app-wide `goalPlan`. */
const v054: Settings = { ...settings, courseId: GERMAN, goalPlan: a2 };

/**
 * The merge ADR-018 §4 prescribes for `updateSettings`: normalize the stored record,
 * spread the other patch fields, then apply `goalPlanUpdate`; validate.
 */
function applyPatch(current: Settings, patch: SettingsPatch): Settings {
  const { goalPlanUpdate, ...rest } = patch;
  const merged = { ...normalizeGoalPlans(current), ...rest };
  return SettingsSchema.parse(goalPlanUpdate ? withGoalPlan(merged, goalPlanUpdate) : merged);
}

describe("SettingsSchema.goalPlans (criteria 1, 9)", () => {
  it("is optional: settings stored before CTO-018 stay valid", () => {
    expect(SettingsSchema.parse(settings)).not.toHaveProperty("goalPlans");
    expect(SettingsSchema.parse(v054)).toEqual(v054);
  });

  it("accepts one plan per course id, including unknown, hidden or level-less courses", () => {
    const goalPlans = { [GERMAN]: a2, [TELC]: b1, "einbuergerung-en-de": b1, "no-such": a2 };
    expect(SettingsSchema.parse({ ...settings, goalPlans }).goalPlans).toEqual(goalPlans);
  });

  it.each([
    ["a key that is not a slug", { "En DE": a2 }],
    ["an empty key", { "": a2 }],
    ["an invalid plan", { [GERMAN]: { ...a2, targetLevel: "D1" } }],
    ["a null plan (clears remove the key instead)", { [GERMAN]: null }],
  ])("rejects %s, which makes the whole record invalid", (_, goalPlans) => {
    expect(GoalPlansSchema.safeParse(goalPlans).success).toBe(false);
    expect(SettingsSchema.safeParse({ ...settings, goalPlans }).success).toBe(false);
  });
});

describe("goalPlanFor (criteria 3, 11)", () => {
  it("returns the course's entry from goalPlans", () => {
    const s = { ...settings, courseId: GERMAN, goalPlans: { [GERMAN]: a2, [TELC]: b1 } };
    expect(goalPlanFor(s, GERMAN)).toEqual(a2);
    expect(goalPlanFor(s, TELC)).toEqual(b1);
    expect(goalPlanFor(s, "en-es")).toBeNull();
  });

  it("reads an old single plan as the plan of the record's active course", () => {
    expect(goalPlanFor(v054, GERMAN)).toEqual(a2);
  });

  it("an old single plan asked for another course is null", () => {
    expect(goalPlanFor(v054, TELC)).toBeNull();
  });

  it("an entry in goalPlans wins over the legacy plan", () => {
    expect(goalPlanFor({ ...v054, goalPlans: { [GERMAN]: b1 } }, GERMAN)).toEqual(b1);
  });

  it("no plan anywhere, or a legacy null, is null", () => {
    expect(goalPlanFor(settings, settings.courseId)).toBeNull();
    expect(goalPlanFor({ ...settings, goalPlan: null }, settings.courseId)).toBeNull();
  });

  it("does not read inherited object keys as course ids", () => {
    expect(goalPlanFor({ ...settings, goalPlans: {} }, "constructor")).toBeNull();
  });
});

describe("normalizeGoalPlans: stored-data migration (criteria 3, 4)", () => {
  it("moves the legacy plan to the active course and drops goalPlan", () => {
    const next = normalizeGoalPlans(v054);
    expect(next).not.toHaveProperty("goalPlan");
    expect(next.goalPlans).toEqual({ [GERMAN]: a2 });
    expect(SettingsSchema.parse(next)).toEqual(next);
  });

  it("keeps an existing entry for the active course (nothing lost or duplicated)", () => {
    const next = normalizeGoalPlans({ ...v054, goalPlans: { [GERMAN]: b1, [TELC]: b1 } });
    expect(next.goalPlans).toEqual({ [GERMAN]: b1, [TELC]: b1 });
  });

  it("drops a legacy null and leaves records without a plan unchanged", () => {
    expect(normalizeGoalPlans({ ...settings, goalPlan: null })).toEqual(settings);
    expect(normalizeGoalPlans(settings)).toEqual(settings);
  });

  it("is idempotent and does not mutate its input", () => {
    const input = structuredClone(v054);
    const once = normalizeGoalPlans(input);
    expect(normalizeGoalPlans(once)).toEqual(once);
    expect(input).toEqual(v054);
  });

  it("goalPlanFor gives the same answer before and after normalizing", () => {
    for (const courseId of [GERMAN, TELC]) {
      expect(goalPlanFor(normalizeGoalPlans(v054), courseId)).toEqual(goalPlanFor(v054, courseId));
    }
  });
});

describe("goalPlanUpdate through the settings patch (criteria 1, 2)", () => {
  it("set A → set B → clear A leaves only B", () => {
    const base = { ...settings, courseId: GERMAN };
    const withA = applyPatch(base, { goalPlanUpdate: { courseId: GERMAN, goalPlan: a2 } });
    const withB = applyPatch(withA, { goalPlanUpdate: { courseId: TELC, goalPlan: b1 } });
    expect(withB.goalPlans).toEqual({ [GERMAN]: a2, [TELC]: b1 });
    const cleared = applyPatch(withB, { goalPlanUpdate: { courseId: GERMAN, goalPlan: null } });
    expect(cleared.goalPlans).toEqual({ [TELC]: b1 });
    expect(goalPlanFor(cleared, GERMAN)).toBeNull();
    expect(goalPlanFor(cleared, TELC)).toEqual(b1);
  });

  it("changing one course's plan leaves the other unchanged", () => {
    const both = { ...settings, goalPlans: { [GERMAN]: a2, [TELC]: b1 } };
    const later = { ...a2, targetDate: "2027-09-01" };
    const next = withGoalPlan(both, { courseId: GERMAN, goalPlan: later });
    expect(next.goalPlans).toEqual({ [GERMAN]: later, [TELC]: b1 });
  });

  it("the update key itself is never stored", () => {
    const next = applyPatch(settings, { goalPlanUpdate: { courseId: GERMAN, goalPlan: a2 } });
    expect(next).not.toHaveProperty("goalPlanUpdate");
  });

  it("a course switch keeps a legacy plan on the course it was made for", () => {
    const switched = applyPatch(v054, { courseId: TELC });
    expect(switched.courseId).toBe(TELC);
    expect(goalPlanFor(switched, TELC)).toBeNull();
    expect(goalPlanFor(switched, GERMAN)).toEqual(a2);
  });

  it("validates the update", () => {
    expect(GoalPlanUpdateSchema.safeParse({ courseId: GERMAN, goalPlan: null }).success).toBe(true);
    expect(GoalPlanUpdateSchema.safeParse({ courseId: "Bad Id", goalPlan: a2 }).success).toBe(
      false,
    );
    expect(GoalPlanUpdateSchema.safeParse({ courseId: GERMAN }).success).toBe(false);
  });
});

describe("queued sync records (criteria 4, 10)", () => {
  const record = {
    id: UUID_A,
    schemaVersion: CONTRACTS_VERSION,
    kind: "settings",
    status: "pending",
    createdAt: "2026-11-25T10:00:00.000Z",
    attemptCount: 0,
    nextAttemptAt: "2026-11-25T10:00:00.000Z",
    lastError: null,
  };

  it("CONTRACTS_VERSION stays 1", () => {
    expect(CONTRACTS_VERSION).toBe(1);
  });

  it("a settings record queued by v0.5.4 (single goalPlan) still parses", () => {
    expect(SyncQueueRecordSchema.safeParse({ ...record, payload: v054 }).success).toBe(true);
  });

  it("a settings record with goalPlans parses", () => {
    const payload = normalizeGoalPlans(v054);
    expect(SyncQueueRecordSchema.safeParse({ ...record, payload }).success).toBe(true);
  });
});
