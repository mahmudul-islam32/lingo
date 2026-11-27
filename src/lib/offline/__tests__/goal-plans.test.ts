import { describe, expect, it } from "vitest";
import { goalPlanFor, SettingsSchema, type GoalPlan } from "@/contracts";
import { CURRENT_KEY } from "../store";
import { createDevice } from "./helpers";

/**
 * PLT-028 / ADR-018 §4: `updateSettings` normalizes the stored record, then spreads the
 * patch, then applies `goalPlanUpdate`. One course's plan never changes another's.
 */
const GERMAN = "en-de";
const TELC = "telc-b1-en-de";
const germanPlan: GoalPlan = { targetLevel: "A2", targetDate: "2027-03-12" };
const telcPlan: GoalPlan = { targetLevel: "B1", targetDate: "2027-06-30" };

/** A device whose stored settings are a v0.5.4 record: one legacy `goalPlan`. */
async function legacyDevice() {
  const device = createDevice();
  const first = await device.open();
  const settings = await first.profile.updateSettings({ courseId: GERMAN, dailyGoalXp: 20 });
  const db = device.raw();
  await db.open();
  await db.table("settings").put({ ...settings, goalPlan: germanPlan }, CURRENT_KEY);
  db.close();
  return device;
}

describe("settings goal plans per course (PLT-028, ADR-018)", () => {
  it("a v0.5.4 record still reads as the plan of its own course", async () => {
    const session = await (await legacyDevice()).open();
    const stored = await session.profile.getSettings();
    expect(stored.goalPlan).toEqual(germanPlan);
    expect(goalPlanFor(stored, GERMAN)).toEqual(germanPlan);
    expect(goalPlanFor(stored, TELC)).toBeNull();
  });

  it("AC 8: a course switch on a v0.5.4 record keeps the plan on the old course only", async () => {
    const session = await (await legacyDevice()).open();
    const next = await session.profile.updateSettings({ courseId: TELC });
    expect(next.courseId).toBe(TELC);
    expect(next).not.toHaveProperty("goalPlan");
    expect(next.goalPlans).toEqual({ [GERMAN]: germanPlan });
    expect(goalPlanFor(next, TELC)).toBeNull();
    // Switching back creates, changes or deletes nothing either.
    const back = await session.profile.updateSettings({ courseId: GERMAN });
    expect(back.goalPlans).toEqual({ [GERMAN]: germanPlan });
    expect(goalPlanFor(back, GERMAN)).toEqual(germanPlan);
  });

  it("a course switch and a plan in one patch: the plan goes to the named course", async () => {
    const session = await (await legacyDevice()).open();
    const next = await session.profile.updateSettings({
      courseId: TELC,
      goalPlanUpdate: { courseId: TELC, goalPlan: telcPlan },
    });
    expect(next.goalPlans).toEqual({ [GERMAN]: germanPlan, [TELC]: telcPlan });
  });

  it("sets and clears one course's plan; others and dailyGoalXp are unchanged", async () => {
    const session = await (await legacyDevice()).open();
    const set = await session.profile.updateSettings({
      goalPlanUpdate: { courseId: TELC, goalPlan: telcPlan },
    });
    expect(set.goalPlans).toEqual({ [GERMAN]: germanPlan, [TELC]: telcPlan });
    expect(set.dailyGoalXp).toBe(20);
    const cleared = await session.profile.updateSettings({
      goalPlanUpdate: { courseId: GERMAN, goalPlan: null },
    });
    expect(cleared.goalPlans).toEqual({ [TELC]: telcPlan });
    expect(cleared.dailyGoalXp).toBe(20);
    expect(cleared.courseId).toBe(GERMAN);
  });

  it("never stores the goalPlanUpdate key and writes a valid record", async () => {
    const device = await legacyDevice();
    const session = await device.open();
    await session.profile.updateSettings({
      goalPlanUpdate: { courseId: TELC, goalPlan: telcPlan },
    });
    const db = device.raw();
    await db.open();
    const raw = await db.table("settings").get(CURRENT_KEY);
    db.close();
    expect(raw).not.toHaveProperty("goalPlanUpdate");
    expect(raw).not.toHaveProperty("goalPlan");
    expect(SettingsSchema.safeParse(raw).success).toBe(true);
  });

  it("rejects an invalid plan without writing", async () => {
    const session = await (await legacyDevice()).open();
    await expect(
      session.profile.updateSettings({
        goalPlanUpdate: { courseId: TELC, goalPlan: { targetLevel: "B1", targetDate: "nope" } },
      }),
    ).rejects.toMatchObject({ name: "InvalidRecordError" });
    expect((await session.profile.getSettings()).goalPlans).toBeUndefined();
  });
});
