import { describe, expect, it } from "vitest";
import { GuestMigrationPayloadSchema, type ExerciseOutcome } from "@/contracts";
import { buildGuestMigrationPayload } from "../account";
import { createDevice, lessonResult } from "./helpers";

const USER = "7f3c2a9e-1b4d-4c6e-8f0a-2d5b7e9c1a3f";
// Matches `lessonResult()`: 5 exercises, 3 first-try correct, 1 skipped.
const outcomes: ExerciseOutcome[] = [
  {
    lessonId: "greetings-1",
    exerciseId: "ex-1",
    exerciseType: "multiple_choice",
    outcome: "correct",
  },
  {
    lessonId: "greetings-1",
    exerciseId: "ex-2",
    exerciseType: "word_bank_translate",
    outcome: "correct",
  },
  { lessonId: "greetings-1", exerciseId: "ex-3", exerciseType: "match_pairs", outcome: "correct" },
  { lessonId: "greetings-1", exerciseId: "ex-4", exerciseType: "cloze", outcome: "incorrect" },
  { lessonId: "greetings-1", exerciseId: "ex-5", exerciseType: "listen", outcome: "skipped" },
];

async function onboardedGuest() {
  const device = createDevice();
  const session = await device.open();
  await session.profile.updateSettings({
    courseId: "en-de",
    dailyGoalXp: 30,
    startLevel: "A2",
    goalPlanUpdate: {
      courseId: "en-de",
      goalPlan: { targetLevel: "B1", targetDate: "2027-06-01" },
    },
  });
  await session.profile.updateSettings({
    goalPlanUpdate: {
      courseId: "telc-b1-en-de",
      goalPlan: { targetLevel: "B1", targetDate: "2027-03-01" },
    },
  });
  await session.profile.completeOnboarding();
  await session.progress.saveLessonResult(
    lessonResult({ courseId: "en-de", kind: "lesson", exerciseOutcomes: outcomes }),
  );
  await session.progress.saveLessonResult(
    lessonResult({ id: "4a1c2b8e-4d5a-4c6b-9e7f-1a2b3c4d5e6f", courseId: "spanish-from-english" }),
  );
  return { device, session };
}

describe("guest migration payload (PLT-013 criterion 3)", () => {
  it("holds profile, settings incl. startLevel and goalPlans, hearts and every result", async () => {
    const { session } = await onboardedGuest();
    const snapshot = await session.account.snapshot();
    const payload = buildGuestMigrationPayload(snapshot);
    expect(GuestMigrationPayloadSchema.safeParse(payload).success).toBe(true);
    expect(payload.guestId).toBe(snapshot.identity.kind === "guest" && snapshot.identity.guestId);
    expect(payload.settings).toMatchObject({
      courseId: "en-de",
      dailyGoalXp: 30,
      startLevel: "A2",
      goalPlans: {
        "en-de": { targetLevel: "B1", targetDate: "2027-06-01" },
        "telc-b1-en-de": { targetLevel: "B1", targetDate: "2027-03-01" },
      },
    });
    expect(payload.profile.onboardedAt).not.toBeNull();
    expect(payload.hearts.current).toBe(5);
    // Every course's results, with kind and outcomes.
    expect(payload.lessonResults.map((r) => r.courseId).sort()).toEqual([
      "en-de",
      "spanish-from-english",
    ]);
    expect(payload.lessonResults.find((r) => r.courseId === "en-de")).toMatchObject({
      kind: "lesson",
      exerciseOutcomes: outcomes,
    });
    // The queue ids at that moment: settings (coalesced), profile and both results.
    expect(snapshot.queueIds).toHaveLength(4);
  });

  it("is the same payload on a retry (same ids, so the RPC dedupes, criterion 9)", async () => {
    const { session } = await onboardedGuest();
    const first = buildGuestMigrationPayload(await session.account.snapshot());
    const second = buildGuestMigrationPayload(await session.account.snapshot());
    expect(second).toEqual(first);
  });

  it("refuses a guest without settings and an account", async () => {
    const device = createDevice();
    const session = await device.open();
    const snapshot = await session.account.snapshot();
    expect(snapshot.settings).toBeNull();
    expect(() => buildGuestMigrationPayload(snapshot)).toThrow();
    await session.account.switchToAccount(USER, { mode: "reset" });
    const accountSnapshot = await session.account.snapshot();
    expect(() => buildGuestMigrationPayload(accountSnapshot)).toThrow();
  });
});

describe("switchToAccount (PLT-013 criteria 4 and 6)", () => {
  it("keep: identity and profile id become the user, migrated queue records go, data stays", async () => {
    const { session } = await onboardedGuest();
    const snapshot = await session.account.snapshot();
    // A result finished after the snapshot is not in the payload: its record stays.
    const later = lessonResult({ id: "5b1c2b8e-4d5a-4c6b-9e7f-1a2b3c4d5e6f", courseId: "en-de" });
    await session.progress.saveLessonResult(later);
    await session.account.switchToAccount(USER, {
      mode: "keep",
      migratedQueueIds: snapshot.queueIds,
    });

    expect(await session.profile.getIdentity()).toEqual({ kind: "account", userId: USER });
    const profile = await session.profile.getProfile();
    expect(profile).toMatchObject({ id: USER, joinedAt: snapshot.profile.joinedAt });
    expect(await session.profile.findSettings()).toEqual(snapshot.settings);
    expect(await session.account.listAllLessonResults()).toHaveLength(3);
    expect((await session.syncQueue.list()).map((r) => r.id)).toEqual([later.id]);
  });

  it("reset: profile, settings and hearts start empty; results and their records stay", async () => {
    const device = createDevice();
    const session = await device.open();
    await session.profile.updateSettings({ courseId: "en-de", dailyGoalXp: 20 });
    await session.progress.saveHearts({
      current: 3,
      refillStartedAt: "2026-11-07T09:00:00.000Z",
      updatedAt: "2026-11-07T09:00:00.000Z",
    });
    await session.account.switchToAccount(USER, { mode: "reset" });

    expect(await session.profile.getIdentity()).toEqual({ kind: "account", userId: USER });
    expect(await session.profile.findSettings()).toBeNull();
    expect((await session.profile.getProfile()).onboardedAt).toBeNull();
    expect((await session.progress.getHearts()).current).toBe(5);
    // The guest's own settings / hearts writes must never reach the account.
    expect(await session.syncQueue.list()).toEqual([]);
  });
});
